package com.studyGroup.backend.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            String token = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            } else {
                token = accessor.getFirstNativeHeader("token");
            }

            if (token != null) {
                System.out.println("✅ STOMP connection received with token: " + token);
                // 🔹 (Optional) Validate using your JWT utility
                // jwtService.validateToken(token);
            } else {
                System.out.println("⚠️ No token found in STOMP CONNECT headers");
            }
        }

        return message;
    }
}
