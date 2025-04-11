package com.sunnytrips.sunnytrips.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

// Essa classe representa o usuário no sistema, contendo todas as informações pessoais e as associações com passeios e viagens.
// Basicamente, é o modelo que vai mapear as informações da tabela "usuarios" do banco para a nossa aplicação.
@Entity
@Table(name = "usuarios")
public class Usuario {

    // Esse atributo é o ID do usuário, usado para identificá-lo unicamente.
    // O valor é gerado automaticamente antes de persistir no banco.
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;  // Será gerado no @PrePersist

    // O nome do usuário é obrigatório, e aqui a gente define que ele precisa ter entre 2 e 100 caracteres.
    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres")
    private String nome;

    // O email também é obrigatório e precisa ser válido, com no máximo 100 caracteres.
    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Email inválido")
    @Size(max = 100, message = "O email deve ter no máximo 100 caracteres")
    private String email;

    // A senha do usuário é fundamental para segurança, devendo ter entre 6 e 50 caracteres.
    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, max = 50, message = "A senha deve ter entre 6 e 50 caracteres")
    private String senha;

    // Abaixo temos os campos relacionados à localização do usuário: país, estado e cidade.
    @NotBlank(message = "O país é obrigatório")
    @Size(max = 50, message = "O país deve ter no máximo 50 caracteres")
    private String pais;

    @NotBlank(message = "O estado é obrigatório")
    @Size(max = 50, message = "O estado deve ter no máximo 50 caracteres")
    private String estado;

    @NotBlank(message = "A cidade é obrigatória")
    @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres")
    private String cidade;

    // Relacionamento: um usuário pode ter muitas viagens.
    // Usamos CascadeType.ALL pra que, se o usuário for removido, as viagens dele também sejam removidas.
    // orphanRemoval=true significa que se alguma viagem for desvinculada do usuário, ela também será removida.
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Viagem> viagens = new ArrayList<>();

    // Relacionamento: um usuário pode ter muitos passeios.
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Passeio> passeios = new ArrayList<>();

    // Esse método é invocado antes do objeto ser persistido no banco.
    // Se o ID ainda não foi definido, a gente gera um número aleatório de 6 dígitos (entre 100000 e 999999) para identificá-lo.
    @PrePersist
    public void generateId() {
        if (this.id == null) {
            // Usamos ThreadLocalRandom pra gerar o número, garantindo que seja único no intervalo desejado.
            this.id = ThreadLocalRandom.current().nextLong(100000, 1000000);
        }
    }

    // Getters e Setters
    // Esses métodos são usados para acessar e atualizar os dados do usuário.

    // Retorna o ID do usuário.
    public Long getId() {
        return id;
    }

    // Define ou atualiza o ID do usuário.
    public void setId(Long id) {
        this.id = id;
    }

    // Retorna o nome do usuário.
    public String getNome() {
        return nome;
    }

    // Define ou atualiza o nome do usuário.
    public void setNome(String nome) {
        this.nome = nome;
    }

    // Retorna o email do usuário.
    public String getEmail() {
        return email;
    }

    // Define ou atualiza o email do usuário.
    public void setEmail(String email) {
        this.email = email;
    }

    // Retorna a senha do usuário.
    public String getSenha() {
        return senha;
    }

    // Define ou atualiza a senha do usuário.
    public void setSenha(String senha) {
        this.senha = senha;
    }

    // Retorna o país do usuário.
    public String getPais() {
        return pais;
    }

    // Define ou atualiza o país do usuário.
    public void setPais(String pais) {
        this.pais = pais;
    }

    // Retorna o estado do usuário.
    public String getEstado() {
        return estado;
    }

    // Define ou atualiza o estado do usuário.
    public void setEstado(String estado) {
        this.estado = estado;
    }

    // Retorna a cidade do usuário.
    public String getCidade() {
        return cidade;
    }

    // Define ou atualiza a cidade do usuário.
    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    // Retorna a lista de viagens associadas ao usuário.
    public List<Viagem> getViagens() {
        return viagens;
    }

    // Define ou atualiza a lista de viagens do usuário.
    public void setViagens(List<Viagem> viagens) {
        this.viagens = viagens;
    }

    // Retorna a lista de passeios associados ao usuário.
    public List<Passeio> getPasseios() {
        return passeios;
    }

    // Define ou atualiza a lista de passeios do usuário.
    public void setPasseios(List<Passeio> passeios) {
        this.passeios = passeios;
    }
}
