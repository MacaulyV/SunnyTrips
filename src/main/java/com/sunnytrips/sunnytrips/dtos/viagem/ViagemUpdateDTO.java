package com.sunnytrips.sunnytrips.dtos.viagem;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

// Esse DTO é utilizado para atualizar os dados de uma viagem existente.
// Nele, garantimos que todos os campos importantes sejam fornecidos corretamente
// e que, por exemplo, a data da viagem seja futura.
public class ViagemUpdateDTO {

    // Precisamos do ID da viagem para saber exatamente qual registro atualizar.
    @NotNull(message = "O id da viagem é obrigatório para atualização")
    private Long id;

    // País de destino da viagem: obrigatório e com até 50 caracteres para manter a consistência.
    @NotBlank(message = "O país de destino é obrigatório")
    @Size(max = 50, message = "O país de destino deve ter no máximo 50 caracteres")
    private String paisDestino;

    // Estado de destino da viagem, também obrigatório e limitado a 50 caracteres.
    @NotBlank(message = "O estado de destino é obrigatório")
    @Size(max = 50, message = "O estado de destino deve ter no máximo 50 caracteres")
    private String estadoDestino;

    // Cidade de destino com a mesma abordagem: obrigatório e limitado a 100 caracteres.
    @NotBlank(message = "A cidade de destino é obrigatória")
    @Size(max = 100, message = "A cidade de destino deve ter no máximo 100 caracteres")
    private String cidadeDestino;

    // Data e hora da viagem. Aqui usamos @Future para garantir que a data informada ainda está por vir.
    @NotNull(message = "A data e hora são obrigatórias")
    @Future(message = "A data e hora devem ser futuras")
    private LocalDateTime dataHora;

    // Getters and Setters
    // Esses métodos ajudam a acessar e modificar os valores dos campos do DTO.

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

    // Define o país de destino, garantindo que não ultrapasse o tamanho máximo permitido.
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

    // Retorna a data e hora agendadas para a viagem.
    public LocalDateTime getDataHora() {
        return dataHora;
    }

    // Define a data e hora da viagem. Deve ser uma data futura, conforme a validação.
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
