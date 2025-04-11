package com.sunnytrips.sunnytrips.dtos.passeio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

// Esse DTO representa os dados que precisamos receber quando alguém vai criar ou atualizar um passeio
// Basicamente, estamos esperando que o usuário informe o local específico e a data/hora do passeio.
public class PasseioRequestDTO {

    // Aqui garantimos que o campo "localEspecifico" não pode ficar vazio.
    // É super importante para identificar o local do passeio!
    @NotBlank(message = "O local específico é obrigatório")
    private String localEspecifico;

    // Esse campo armazena a data e a hora do passeio. Usamos NotNull pra garantir que esse valor seja sempre informado.
    @NotNull(message = "A data e hora são obrigatórias")
    private LocalDateTime dataHora;

    // Getters e Setters

    // Método para obter o local específico definido para o passeio.
    public String getLocalEspecifico() {
        return localEspecifico;
    }

    // Método para definir ou atualizar o local específico do passeio.
    public void setLocalEspecifico(String localEspecifico) {
        this.localEspecifico = localEspecifico;
    }

    // Método para obter a data e hora configuradas para o passeio.
    public LocalDateTime getDataHora() {
        return dataHora;
    }

    // Método para definir ou atualizar a data e hora do passeio.
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
