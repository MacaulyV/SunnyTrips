package com.sunnytrips.sunnytrips.dtos.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Essa classe é o DTO de requisição de login.
// Aqui a gente define os dados que o usuário precisa enviar para fazer login (email e senha).
public class LoginRequestDTO {

    // Campo de email que não pode ficar vazio e precisa ser um email válido.
    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    // Campo da senha, também não pode ser vazio.
    @NotBlank(message = "A senha é obrigatória")
    private String senha;

    // Getters e Setters
    // Esse método retorna o valor do email que foi definido no objeto.
    public String getEmail() {
        return email;
    }
    // Esse método define/atualiza o email no objeto.
    public void setEmail(String email) {
        this.email = email;
    }
    // Esse método retorna a senha que foi definida.
    public String getSenha() {
        return senha;
    }
    // Esse método define/atualiza a senha do usuário.
    public void setSenha(String senha) {
        this.senha = senha;
    }
}
