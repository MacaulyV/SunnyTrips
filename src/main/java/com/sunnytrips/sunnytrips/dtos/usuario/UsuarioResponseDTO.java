package com.sunnytrips.sunnytrips.dtos.usuario;

// Esse DTO de resposta é usado para enviar os dados básicos do usuário para quem requisitou,
// como a API responderá com essas informações quando alguém pedir os detalhes do usuário.
public class UsuarioResponseDTO {

    // Variável para armazenar o ID único do usuário.
    private Long id;

    // Nome do usuário, que serve para identificar ele de forma amigável.
    private String nome;

    // Email do usuário, importante para contato e autenticação.
    private String email;

    // País de residência do usuário.
    private String pais;

    // Estado onde o usuário mora.
    private String estado;

    // Cidade do usuário.
    private String cidade;

    // Getters e Setters
    // Esses métodos vão facilitar na hora de acessar ou atualizar os dados dos campos.

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
