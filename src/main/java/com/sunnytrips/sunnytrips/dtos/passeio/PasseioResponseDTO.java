package com.sunnytrips.sunnytrips.dtos.passeio;

import java.time.LocalDateTime;

// Esse DTO de resposta serve para mandar os dados de um passeio de volta para quem fez a requisição.
// Normalmente ele contém o ID do passeio, o local específico e a data/hora do passeio.
public class PasseioResponseDTO {

    // Variável que guarda o ID do passeio. É importante pra identificar unicamente cada passeio.
    private Long id;

    // Armazena o local específico do passeio, que foi definido quando o passeio foi criado.
    private String localEspecifico;

    // Guarda a data e a hora programadas para o passeio.
    private LocalDateTime dataHora;

    // Getters e Setters
    // Método para retornar o ID do passeio.
    public Long getId() {
        return id;
    }

    // Método para definir ou atualizar o ID do passeio.
    public void setId(Long id) {
        this.id = id;
    }

    // Método para retornar o local específico do passeio.
    public String getLocalEspecifico() {
        return localEspecifico;
    }

    // Método para definir ou atualizar o local específico do passeio.
    public void setLocalEspecifico(String localEspecifico) {
        this.localEspecifico = localEspecifico;
    }

    // Método para retornar a data e hora do passeio.
    public LocalDateTime getDataHora() {
        return dataHora;
    }

    // Método para definir ou atualizar a data e hora do passeio.
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
