package com.sunnytrips.sunnytrips.dtos.passeio;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

// Esse DTO é responsável por receber os dados que serão atualizados de um passeio.
// A intenção aqui é garantir que tudo que for enviado para atualizar um passeio esteja correto,
// validando campos obrigatórios, limites de caracteres e se a data é futura, tudo isso para evitar problemas.
public class PasseioUpdateDTO {

    // Precisamos receber o ID do passeio para saber qual deles estamos atualizando.
    // Então, esse campo não pode ser nulo!
    @NotNull(message = "O id do passeio é obrigatório para atualização")
    private Long id;

    // Esse campo armazena o novo local específico do passeio.
    // Aqui a gente garante que o local não fique vazio e que não ultrapasse 255 caracteres, para evitar dados inválidos.
    @NotBlank(message = "O local específico é obrigatório")
    @Size(max = 255, message = "O local específico deve ter no máximo 255 caracteres")
    private String localEspecifico;

    // Esse campo guarda a nova data e hora do passeio.
    // É importante que a data e a hora sejam futuras, por isso usamos @Future para não permitir
    // que se insiram datas que já passaram.
    @NotNull(message = "A data e hora são obrigatórias")
    @Future(message = "A data e hora devem ser futuras")
    private LocalDateTime dataHora;

    // Getters e Setters

    // Esse método pega o ID do passeio que vai ser atualizado.
    public Long getId() {
        return id;
    }

    // Aqui é onde definimos o ID do passeio; essencial para identificar qual passeio atualizar.
    public void setId(Long id) {
        this.id = id;
    }

    // Método para obter o local específico do passeio.
    public String getLocalEspecifico() {
        return localEspecifico;
    }

    // Método para atualizar o local específico do passeio, garantindo que o valor atende os requisitos de validação.
    public void setLocalEspecifico(String localEspecifico) {
        this.localEspecifico = localEspecifico;
    }

    // Método para pegar a data e hora configurada para o passeio.
    public LocalDateTime getDataHora() {
        return dataHora;
    }

    // Método para definir ou atualizar a data e hora do passeio. Aqui esperamos uma data futura.
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
