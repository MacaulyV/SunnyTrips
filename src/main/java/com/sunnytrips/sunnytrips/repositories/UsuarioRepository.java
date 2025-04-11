package com.sunnytrips.sunnytrips.repositories;

import com.sunnytrips.sunnytrips.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Esse repositório é responsável por gerenciar a persistência dos dados do usuário.
// Estamos extendendo o JpaRepository para herdar métodos padrões de CRUD (create, read, update, delete),
// o que facilita bastante a implementação sem ter que escrever um monte de código repetitivo.
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Esse método permite buscar um usuário pelo email.
    // É super útil para operações de login ou validações, já que o email normalmente é único.
    Usuario findByEmail(String email);
}
