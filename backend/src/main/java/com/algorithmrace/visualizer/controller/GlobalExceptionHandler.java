package com.algorithmrace.visualizer.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
		// Log the actual exception server-side for debugging, but never reflect
		// raw user input back to the client to prevent reflected XSS/info leakage.
		log.warn("Bad request: {}", ex.getMessage());
		Map<String, String> error = new HashMap<>();
		error.put("error", "Bad Request");
		error.put("message", "The request contains invalid parameters. Please check your input.");
		return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
		log.warn("Validation failed: {}", ex.getMessage());
		Map<String, String> error = new HashMap<>();
		error.put("error", "Validation Failed");
		error.put("message", "Invalid input data provided. Please verify all fields.");
		return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
		// Log full stack trace server-side for diagnosis, return generic message to client
		log.error("Unexpected error occurred", ex);
		Map<String, String> error = new HashMap<>();
		error.put("error", "Internal Server Error");
		error.put("message", "An unexpected error occurred. Please try again later.");
		return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
