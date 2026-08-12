package com.cakedelight.order.client;

import com.cakedelight.order.dto.CatalogCakeResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class CatalogClient {

    private final RestClient restClient;

    public CatalogClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public CatalogCakeResponse getCakeById(Long cakeId) {

        return restClient.get()
                .uri("/api/cakes/{id}", cakeId)
                .retrieve()
                .body(CatalogCakeResponse.class);
    }
}