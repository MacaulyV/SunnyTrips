package com.sunnytrips.sunnytrips.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Future;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

// Essa classe representa uma viagem no sistema,
// mapeando os dados para a tabela "viagens" no banco de dados.
@Entity
@Table(name = "viagens")
public class Viagem {

    // Esse campo é o ID único da viagem. Ele não pode ser alterado após ser criado.
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    // Campo para armazenar o país de destino da viagem.
    // Usamos as anotações para garantir que o valor não seja vazio e que não ultrapasse 50 caracteres.
    @NotBlank(message = "O país de destino é obrigatório")
    @Size(max = 50, message = "O país de destino deve ter no máximo 50 caracteres")
    private String paisDestino;

    // Campo para o estado de destino. Também não pode ser vazio e tem limite de 50 caracteres.
    @NotBlank(message = "O estado de destino é obrigatório")
    @Size(max = 50, message = "O estado de destino deve ter no máximo 50 caracteres")
    private String estadoDestino;

    // Campo para armazenar a cidade de destino da viagem.
    // Esse valor é obrigatório e não pode ultrapassar 100 caracteres.
    @NotBlank(message = "A cidade de destino é obrigatória")
    @Size(max = 100, message = "A cidade de destino deve ter no máximo 100 caracteres")
    private String cidadeDestino;

    // Campo para a data e hora da viagem.
    // É obrigatório e a data deve ser no futuro, garantindo que a viagem seja agendada para depois.
    @NotNull(message = "A data e hora são obrigatórias")
    @Future(message = "A data e hora devem ser futuras")
    private LocalDateTime dataHora;

    // Relação com o usuário: cada viagem deve estar associada a um usuário.
    // Aqui usamos @ManyToOne, pois muitos registros de viagem podem estar vinculados a um único usuário.
    @NotNull(message = "O usuário é obrigatório")
    @ManyToOne
    @JoinColumn(name = "usuario_id", columnDefinition = "VARCHAR2(36)")
    private Usuario usuario;

    // Método para gerar um ID de forma automática antes da persistência no banco.
    // Se o ID ainda não foi definido, gera um número aleatório de 6 dígitos,
    // o que ajuda a garantir uma identificação única para a viagem.
    @PrePersist
    public void generateId() {
        if (this.id == null) {
            // Gera um número aleatório entre 100000 e 999999.
            this.id = ThreadLocalRandom.current().nextLong(100000, 1000000);
        }
    }

    // Getters e Setters
    // Esses métodos permitem que a gente acesse e modifique os valores dos atributos da viagem sem alterar diretamente as variáveis.

    // Retorna o ID da viagem.
    public Long getId() {
        return id;
    }

    // Define ou atualiza o ID da viagem. Geralmente, esse método não é utilizado pois o ID é gerado automaticamente.
    public void setId(Long id) {
        this.id = id;
    }

    // Retorna o país de destino da viagem.
    public String getPaisDestino() {
        return paisDestino;
    }

    // Define ou atualiza o país de destino da viagem.
    public void setPaisDestino(String paisDestino) {
        this.paisDestino = paisDestino;
    }

    // Retorna o estado de destino da viagem.
    public String getEstadoDestino() {
        return estadoDestino;
    }

    // Define ou atualiza o estado de destino da viagem.
    public void setEstadoDestino(String estadoDestino) {
        this.estadoDestino = estadoDestino;
    }

    // Retorna a cidade de destino da viagem.
    public String getCidadeDestino() {
        return cidadeDestino;
    }

    // Define ou atualiza a cidade de destino da viagem.
    public void setCidadeDestino(String cidadeDestino) {
        this.cidadeDestino = cidadeDestino;
    }

    // Retorna a data e hora da viagem.
    public LocalDateTime getDataHora() {
        return dataHora;
    }

    // Define ou atualiza a data e hora da viagem.
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    // Retorna o usuário associado à viagem.
    public Usuario getUsuario() {
        return usuario;
    }

    // Define ou atualiza o usuário associado à viagem.
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
