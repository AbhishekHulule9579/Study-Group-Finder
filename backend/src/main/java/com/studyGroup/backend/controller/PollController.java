package com.studyGroup.backend.controller;

import com.studyGroup.backend.dto.ChatMessageDTO;
import com.studyGroup.backend.dto.PollOptionDTO;
import com.studyGroup.backend.model.Group;
import com.studyGroup.backend.model.GroupMessage;
import com.studyGroup.backend.model.Poll;
import com.studyGroup.backend.model.PollOption;
import com.studyGroup.backend.model.User;
import com.studyGroup.backend.repository.GroupMessageRepository;
import com.studyGroup.backend.repository.GroupRepository;
import com.studyGroup.backend.repository.PollOptionRepository;
import com.studyGroup.backend.repository.PollRepository;
import com.studyGroup.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PollController {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMessageRepository groupMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/{groupId}/polls")
    public ResponseEntity<?> createPoll(@PathVariable Long groupId, @RequestBody CreatePollRequest req,
                                        @RequestHeader("Authorization") String authHeader) {
        // For simplicity this example expects client to provide creatorId in request; in prod use JWT
        Integer creatorId = req.getCreatorId();
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        User creator = userRepository.findById(creatorId).orElseThrow(() -> new RuntimeException("User not found"));

        Poll poll = new Poll();
        poll.setGroup(group);
        poll.setCreator(creator);
        poll.setQuestion(req.getQuestion());
        poll.setCreatedAt(LocalDateTime.now());
        Poll saved = pollRepository.save(poll);

        List<PollOption> options = req.getOptions().stream().map(opt -> {
            PollOption p = new PollOption();
            p.setPoll(saved);
            p.setOptionText(opt);
            p.setVoteCount(0L);
            return p;
        }).collect(Collectors.toList());
        // save and capture saved entities (ensure IDs available)
        List<PollOption> savedOptions = pollOptionRepository.saveAll(options);

        // Create a GroupMessage representing the poll
    GroupMessage gm = new GroupMessage();
        gm.setGroup(group);
        gm.setSender(creator);
        gm.setContent(req.getQuestion());
        gm.setMessageType("POLL");
        gm.setTimestamp(LocalDateTime.now());
    // associate poll id on the message so it's discoverable in history
    groupMessageRepository.save(gm);
    gm.setPollId(saved.getId());
    GroupMessage savedMsg = groupMessageRepository.save(gm);

        // Build DTO to broadcast
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setGroupId(groupId);
        dto.setMessageId(savedMsg.getId());
        dto.setSenderId(creator.getId());
        dto.setSenderName(creator.getName());
        dto.setContent(savedMsg.getContent());
        dto.setTimestamp(savedMsg.getTimestamp());
        dto.setMessageType("POLL");
        dto.setPollId(saved.getId());
    dto.setPollOptions(savedOptions.stream()
        .map(o -> new PollOptionDTO(o.getId(), o.getOptionText(), o.getVoteCount()))
        .collect(Collectors.toList()));

        // Broadcast
        messagingTemplate.convertAndSend("/topic/group/" + groupId, dto);

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/polls/{pollId}/options/{optionId}/vote")
    public ResponseEntity<?> vote(@PathVariable Long pollId, @PathVariable Long optionId, @RequestBody VoteRequest req) {
        // simple vote increment (no duplicate protection)
        PollOption opt = pollOptionRepository.findById(optionId).orElseThrow(() -> new RuntimeException("Option not found"));
        opt.setVoteCount(opt.getVoteCount() + 1);
        PollOption savedOpt = pollOptionRepository.save(opt);

        // broadcast vote update to group so other clients can update UI live
        Long groupId = savedOpt.getPoll().getGroup().getGroupId();
        // minimal payload
        PollVoteDTO voteDto = new PollVoteDTO();
        voteDto.setMessageType("POLL_VOTE");
        voteDto.setPollId(pollId);
        voteDto.setOptionId(savedOpt.getId());
        voteDto.setVoteCount(savedOpt.getVoteCount());
        messagingTemplate.convertAndSend("/topic/group/" + groupId, voteDto);

        // return updated option
        return ResponseEntity.ok(new PollOptionDTO(savedOpt.getId(), savedOpt.getOptionText(), savedOpt.getVoteCount()));
    }

    public static class CreatePollRequest {
        private Integer creatorId;
        private String question;
        private List<String> options;
        public Integer getCreatorId() { return creatorId; }
        public void setCreatorId(Integer c) { this.creatorId = c; }
        public String getQuestion() { return question; }
        public void setQuestion(String q) { this.question = q; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> o) { this.options = o; }
    }

    public static class VoteRequest {
        private Integer voterId; // not used in this simple impl
        public Integer getVoterId() { return voterId; }
        public void setVoterId(Integer v) { this.voterId = v; }
    }
}
