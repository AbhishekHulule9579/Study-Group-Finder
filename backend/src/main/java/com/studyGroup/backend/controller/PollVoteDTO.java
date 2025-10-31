package com.studyGroup.backend.controller;

import lombok.Data;

@Data
public class PollVoteDTO {
    private String messageType; // will be "POLL_VOTE"
    private Long pollId;
    private Long optionId;
    private Long voteCount;
}
