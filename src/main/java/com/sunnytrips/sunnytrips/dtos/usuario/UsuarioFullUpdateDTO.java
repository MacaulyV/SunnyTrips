package com.sunnytrips.sunnytrips.dtos.usuario;

import com.sunnytrips.sunnytrips.dtos.viagem.ViagemUpdateDTO;
import com.sunnytrips.sunnytrips.dtos.passeio.PasseioUpdateDTO;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

// Esse DTO é usado quando precisamos atualizar TODOS os dados do usuário, incluindo suas viagens e passeios.
// A ideia aqui é enviar tudo de uma vez, porque às vezes precisamos garantir que todas as informações estejam em sincronia.
public class UsuarioFullUpdateDTO {

    // O nome do usuário é obrigatório, então não pode ser nulo nem vazio.
    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    // O email também é fundamental para identificar o usuário e precisa seguir o formato correto.
    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    // A senha é essencial para a segurança do usuário, por isso ela não pode faltar.
    @NotBlank(message = "A senha é obrigatória")
    private String senha;

    // País, estado e cidade ajudam a completar o perfil do usuário. Esses campos também são obrigatórios.
    @NotBlank(message = "O país é obrigatório")
    private String pais;

    @NotBlank(message = "O estado é obrigatório")
    private String estado;

    @NotBlank(message = "A cidade é obrigatória")
    private String cidade;

    // Aqui temos a lista de viagens. Usamos um DTO de atualização para cada viagem porque queremos atualizar os dados de cada uma.
    // É importante que essa lista não seja nula, mesmo que esteja vazia.
    @NotNull(message = "A lista de viagens não pode ser nula")
    private List<ViagemUpdateDTO> viagens;

    // E aqui está a lista de passeios. Mesma ideia: não pode ser nula e usamos um DTO para garantir que os dados estejam corretos.
    @NotNull(message = "A lista de passeios não pode ser nula")
    private List<PasseioUpdateDTO> passeios;

    // Getters e Setters

    // Método para pegar o nome do usuário. Importante pra utilizar em outros processos.
    public String getNome() {
        return nome;
    }

    // Define ou atualiza o nome. Sempre pensando em manter os dados consistentes.
    public void setNome(String nome) {
        this.nome = nome;
    }

    // Pega o email do usuário, que é super importante para comunicação e login.
    public String getEmail() {
        return email;
    }

    // Define ou atualiza o email, com a validação já garantida pelas anotações.
    public void setEmail(String email) {
        this.email = email;
    }

    // Retorna a senha do usuário. Em um cenário real, a gente teria cuidado com a segurança disso, mas aqui é só para o DTO.
    public String getSenha() {
        return senha;
    }

    // Define a senha. É crucial para a autenticação.
    public void setSenha(String senha) {
        this.senha = senha;
    }

    // Pega o país do usuário, ajudando a definir o perfil completo.
    public String getPais() {
        return pais;
    }

    // Define ou atualiza o país.
    public void setPais(String pais) {
        this.pais = pais;
    }

    // Método para obter o estado.
    public String getEstado() {
        return estado;
    }

    // Define ou atualiza o estado do usuário.
    public void setEstado(String estado) {
        this.estado = estado;
    }

    // Pega a cidade do usuário, que é outra parte importante do endereço.
    public String getCidade() {
        return cidade;
    }

    // Define ou atualiza a cidade.
    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    // Retorna a lista de viagens que o usuário tem. Isso é útil para exibir o histórico ou agendar novas atualizações.
    public List<ViagemUpdateDTO> getViagens() {
        return viagens;
    }

    // Define a lista de viagens. Garante que a atualização englobe tudo que foi planejado.
    public void setViagens(List<ViagemUpdateDTO> viagens) {
        this.viagens = viagens;
    }

    // Retorna a lista de passeios associados ao usuário.
    public List<PasseioUpdateDTO> getPasseios() {
        return passeios;
    }

    // Define ou atualiza a lista de passeios. Assim, conseguimos manter as atividades bem integradas ao perfil.
    public void setPasseios(List<PasseioUpdateDTO> passeios) {
        this.passeios = passeios;
    }
}
