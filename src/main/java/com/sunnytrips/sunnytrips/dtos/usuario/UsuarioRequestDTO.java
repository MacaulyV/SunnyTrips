package com.sunnytrips.sunnytrips.dtos.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Esse DTO é usado para receber os dados quando estamos criando um novo usuário.
// Aqui definimos os campos obrigatórios que o usuário precisa preencher para se cadastrar.
public class UsuarioRequestDTO {

    // O nome do usuário é super importante e não pode estar em branco.
    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    // O email precisa ser informado e, além disso, tem que ter um formato válido.
    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    // A senha também é obrigatória, já que é essencial para a segurança do login.
    @NotBlank(message = "A senha é obrigatória")
    private String senha;

    // Aqui começamos as informações de localização. O país é obrigatório para o cadastro.
    @NotBlank(message = "O país é obrigatório")
    private String pais;

    // Também precisamos saber o estado do usuário, então esse campo não pode ser deixado vazio.
    @NotBlank(message = "O estado é obrigatório")
    private String estado;

    // Por fim, a cidade completa o endereço do usuário e também é obrigatória.
    @NotBlank(message = "A cidade é obrigatória")
    private String cidade;

    // Getters e Setters
    // Esses métodos servem para acessar e atualizar os valores dos campos acima.

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

    // Retorna a senha do usuário. (Em uma situação real, a gente teria cuidado com isso, mas aqui é só para o DTO!)
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
}
