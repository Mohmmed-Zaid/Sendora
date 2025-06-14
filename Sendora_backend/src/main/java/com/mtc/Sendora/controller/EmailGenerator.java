package com.mtc.Sendora.controller;

import com.mtc.Sendora.service.EmailGeneratorService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@AllArgsConstructor
@CrossOrigin(origins = {"https://mail.google.com", "chrome-extension://*", "http://localhost:5173"})
public class EmailGenerator {

    private final EmailGeneratorService emailGeneratorService;

    /**
     * Handles POST requests to /api/email/generate to generate an email reply.
     *
     * @param emailRequest The request body containing email content and tone.
     * @return A ResponseEntity with the generated email reply as plain text.
     */
    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest) {
        // Call the service to generate the email reply
        String response = emailGeneratorService.generateEmailReply(emailRequest);

        // Return the response as plain text
        return ResponseEntity.ok()
                .header("Content-Type", "text/plain")
                .body(response);
    }
}