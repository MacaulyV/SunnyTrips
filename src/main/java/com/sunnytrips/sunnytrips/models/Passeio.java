package com.sunnytrips.sunnytrips.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Future;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

// Essa classe representa um passeio no nosso sistema.
// Cada objeto Passeio corresponde a um registro na tabela "passeios" do banco.
@Entity
@Table(name = "passeios")
public class Passeio {

    // O campo ID serve para identificar unicamente cada passeio.
    // Aqui, definimos que ele não pode ser alterado depois de criado e não pode ser nulo.
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    // Esse campo guarda o local específico do passeio.
    // Usamos @NotBlank para garantir que o local seja informado e @Size para limitar a 255 caracteres.
    @NotBlank(message = "O local específico é obrigatório")
    @Size(max = 255, message = "O local específico deve ter no máximo 255 caracteres")
    private String localEspecifico;

    // Campo para a data e hora do passeio.
    // @NotNull indica que deve ser informado, e @Future garante que a data precisa ser uma data futura.
    @NotNull(message = "A data e hora são obrigatórias")
    @Future(message = "A data e hora devem ser futuras")
    private LocalDateTime dataHora;

    // Representa o usuário que criou ou está associado a esse passeio.
    // Utilizamos @ManyToOne pois muitos passeios podem ser associados a um único usuário.
    // O campo "usuario_id" na tabela "passeios" vai guardar essa associação.
    @NotNull(message = "O usuário é obrigatório")
    @ManyToOne
    @JoinColumn(name = "usuario_id", columnDefinition = "VARCHAR2(36)")
    private Usuario usuario;

    // Método que é executado antes de persistir o objeto no banco.
    // Aqui, se o ID ainda não foi definido, a gente gera um número aleatório de 6 dígitos.
    // Isso garante que cada passeio terá um identificador único.
    @PrePersist
    public void generateId() {
        if (this.id == null) {
            // Gera um número aleatório entre 100000 e 999999.
            this.id = ThreadLocalRandom.current().nextLong(100000, 1000000);
        }
    }

    // Getters e Setters

    // Retorna o ID do passeio.
    public Long getId() {
        return id;
    }

    // Define ou atualiza o ID do passeio (normalmente, não vamos usar isso pois o ID é gerado automaticamente).
    public void setId(Long id) {
        this.id = id;
    }

    // Retorna o local específico do passeio.
    public String getLocalEspecifico() {
        return localEspecifico;
    }

    // Define ou atualiza o local específico do passeio.
    public void setLocalEspecifico(String localEspecifico) {
        this.localEspecifico = localEspecifico;
    }

    // Retorna a data e hora do passeio.
    public LocalDateTime getDataHora() {
        return dataHora;
    }

    // Define ou atualiza a data e hora do passeio.
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    // Retorna o usuário associado a esse passeio.
    public Usuario getUsuario() {
        return usuario;
    }

    // Define ou atualiza o usuário associado ao passeio.
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
