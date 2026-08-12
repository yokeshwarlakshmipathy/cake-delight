package com.cakedelight.catalog.exception;

public class CakeNotFoundException extends RuntimeException {

    public CakeNotFoundException(String message) {
        super(message);
    }
}