package com.mtc.Sendora.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mtc.Sendora.controller.EmailRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(EmailGeneratorService.class);

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        String prompt = buildPrompt(emailRequest);

        Map<String,Object> requestBody = Map.of(
                "contents",new Object[]{
                        Map.of("parts",new Object[]{
                                Map.of("text",prompt)
                        })
                }
        );

        String fullGeminiUri = geminiApiUrl + geminiApiKey;

        // *** ADDED LOGGING HERE ***
        logger.info("EmailGeneratorService: Starting generateEmailReply for content: {}", emailRequest.getEmailContent());
        logger.info("EmailGeneratorService: Prompt being sent to Gemini: {}", prompt);
        logger.info("EmailGeneratorService: Full Gemini API URI constructed: {}", fullGeminiUri);
        // Be cautious about logging sensitive keys in production, but for debugging it's essential.
        // logger.info("EmailGeneratorService: Gemini API Key being used: {}", geminiApiKey);

        String response;
        try {
            logger.info("Attempting to call Gemini API for email reply generation.");

            response = webClient.post()
                    .uri(fullGeminiUri)
                    .header("Content-Type","application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("Successfully received response from Gemini API.");
            logger.debug("Gemini API Raw Response: {}", response); // Log raw response for deeper inspection if needed

        } catch (WebClientResponseException e) {
            logger.error("WebClient error calling Gemini API: Status - {}, Response Body - {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            // This is the CRITICAL log. The response body will tell you the exact Google error.
            return "Error from Gemini API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString();
        } catch (Exception e) {
            logger.error("An unexpected error occurred during Gemini API call: {}", e.getMessage(), e);
            return "An unexpected error occurred: " + e.getMessage();
        }

        return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);

            String extractedText = rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
            logger.info("Successfully extracted text from Gemini response.");
            return extractedText;

        } catch (Exception e) {
            logger.error("Error processing Gemini response JSON: {}", e.getMessage(), e);
            return "Error processing Gemini response: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a Professional email reply for the following email content. Please don't generate the subject.");

        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()){
            prompt.append(" Use a ").append(emailRequest.getTone()).append(" tone.");
        }
        prompt.append("\nOriginal email: \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}
