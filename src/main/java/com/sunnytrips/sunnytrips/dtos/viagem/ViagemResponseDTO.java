package com.sunnytrips.sunnytrips.dtos.viagem;

import java.time.LocalDateTime;

// Esse DTO de resposta é usado para enviar os detalhes de uma viagem de volta para o cliente,
// contendo informações como o ID, os destinos e a data/hora da viagem.
public class ViagemResponseDTO {

    // Armazena o ID único da viagem.
    private Long id;

    // País de destino para a viagem. Fundamental para identificar o local.
    private String paisDestino;

    // Estado de destino da viagem, ajudando a refinar a informação do local.
    private String estadoDestino;

    // Cidade de destino, completando os dados necessários sobre onde a viagem será.
    private String cidadeDestino;

    // Data e hora agendadas para a viagem.
    private LocalDateTime dataHora;

    // Getters e Setters
    // Esses métodos permitem acessar e modificar os atributos da viagem.

    // Retorna o ID da viagem.
    public Long getId() {
        return id;
    }

    // Define o ID da viagem.
    public void setId(Long id) {
        this.id = id;
    }

    // Retorna o país de destino.
    public String getPaisDestino() {
        return paisDestino;
    }

    // Define o país de destino.
    public void setPaisDestino(String paisDestino) {
        this.paisDestino = paisDestino;
    }

    // Retorna o estado de destino.
    public String getEstadoDestino() {
        return estadoDestino;
    }

    // Define o estado de destino.
    public void setEstadoDestino(String estadoDestino) {
        this.estadoDestino = estadoDestino;
    }

    // Retorna a cidade de destino.
    public String getCidadeDestino() {
        return cidadeDestino;
    }

    // Define a cidade de destino.
    public void setCidadeDestino(String cidadeDestino) {
        this.cidadeDestino = cidadeDestino;
    }

    // Retorna a data e hora da viagem.
    public LocalDateTime getDataHora() {
        return dataHora;
    }

    // Define a data e hora da viagem.
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
