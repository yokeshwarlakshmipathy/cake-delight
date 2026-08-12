package com.cakedelight.order;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestClient;

@SpringBootApplication
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }

    @Bean
    public RestClient catalogRestClient(
            @Value("${catalog.service.url:http://localhost:8081}") String catalogServiceUrl) {

        return RestClient.builder()
                .baseUrl(catalogServiceUrl)
                .build();
    }
}