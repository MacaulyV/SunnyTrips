package com.sunnytrips.sunnytrips.dtos.viagem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

// Esse DTO serve para receber os dados quando alguém cria ou atualiza uma viagem.
// Aqui o usuário precisa informar os destinos e a data/hora da viagem, e a gente valida essas informações.
public class ViagemRequestDTO {

    // Campo para o país de destino. Não pode ser vazio, pois é essencial saber para onde a viagem vai.
    @NotBlank(message = "O país de destino é obrigatório")
    private String paisDestino;

    // Campo para o estado de destino. Também é obrigatório para identificar a região.
    @NotBlank(message = "O estado de destino é obrigatório")
    private String estadoDestino;

    // Campo para a cidade de destino, indispensável para complementar as informações do local.
    @NotBlank(message = "A cidade de destino é obrigatória")
    private String cidadeDestino;

    // Esse campo guarda a data e a hora da viagem.
    // É importante que não seja nulo para que possamos agendar a viagem corretamente.
    @NotNull(message = "A data e hora são obrigatórias")
    private LocalDateTime dataHora;

    // Getters e Setters
    // Esses métodos servem para acessar e modificar os valores das variáveis acima.

    // Método para retornar o país de destino.
    public String getPaisDestino() {
        return paisDestino;
    }

    // Método para definir ou atualizar o país de destino.
    public void setPaisDestino(String paisDestino) {
        this.paisDestino = paisDestino;
    }

    // Método para retornar o estado de destino.
    public String getEstadoDestino() {
        return estadoDestino;
    }

    // Método para definir ou atualizar o estado de destino.
    public void setEstadoDestino(String estadoDestino) {
        this.estadoDestino = estadoDestino;
    }

    // Método para retornar a cidade de destino.
    public String getCidadeDestino() {
        return cidadeDestino;
    }

    // Método para definir ou atualizar a cidade de destino.
    public void setCidadeDestino(String cidadeDestino) {
        this.cidadeDestino = cidadeDestino;
    }

    // Método para retornar a data e hora da viagem.
    public LocalDateTime getDataHora() {
        return dataHora;
    }

    // Método para definir ou atualizar a data e hora da viagem.
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
