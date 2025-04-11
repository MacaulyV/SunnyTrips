package com.sunnytrips.sunnytrips.controllers;

import com.sunnytrips.sunnytrips.models.Usuario;
import com.sunnytrips.sunnytrips.services.UsuarioService;
import com.sunnytrips.sunnytrips.dtos.usuario.UsuarioCompleteResponseDTO;
import com.sunnytrips.sunnytrips.dtos.usuario.UsuarioRequestDTO;
import com.sunnytrips.sunnytrips.dtos.usuario.UsuarioResponseDTO;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Controller
public class FrontEndController {

    @Autowired
    private UsuarioService usuarioService;

    // Página inicial - redireciona para dashboard se logado, ou para login
    @GetMapping("/")
    public String index(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario != null) {
            return "redirect:/dashboard";
        } else {
            return "redirect:/login";
        }
    }

    // Exibe a página de login
    @GetMapping("/login")
    public String showLoginPage(Model model) {
        return "pages/login";  // Certifique-se de que o template esteja em templates/pages/login.html
    }

    // Processa o login: se autenticado, redireciona para a dashboard; caso contrário, permanece na página de login
    @PostMapping("/login")
    public String processLogin(@RequestParam String email,
                               @RequestParam String senha,
                               Model model,
                               HttpSession session) {
        Usuario usuario = usuarioService.login(email, senha);
        if (usuario != null) {
            // Armazena o usuário na sessão
            session.setAttribute("usuario", usuario);
            return "redirect:/dashboard";
        } else {
            model.addAttribute("errorMessage", "Email ou senha inválidos.");
            return "pages/login";
        }
    }

    // Exibe a página de cadastro (registro)
    @GetMapping("/cadastro")
    public String showCadastroPage() {
        return "pages/cadastro";  // templates/pages/cadastro.html
    }

    // Exibe a dashboard para usuários logados (área restrita)
    @GetMapping("/dashboard")
    public String showDashboard(Model model, HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null) {
            // Se o usuário não estiver logado, redireciona para login
            return "redirect:/login";
        }
        
        // Busca o usuário completo (com viagens e passeios) do banco de dados
        Optional<UsuarioCompleteResponseDTO> usuarioCompleto = usuarioService.buscarUsuarioCompletoPorId(usuario.getId());
        
        if (usuarioCompleto.isPresent()) {
            model.addAttribute("usuario", usuarioCompleto.get());
            return "pages/dashboard";
        } else {
            // Se por algum motivo o usuário não for encontrado no banco, invalida a sessão e redireciona para login
            session.invalidate();
            return "redirect:/login";
        }
    }
    
    // Endpoint para atualizar a sessão com os dados atualizados do usuário
    @PostMapping("/atualizarSessao")
    @ResponseBody
    public ResponseEntity<String> atualizarSessao(@RequestBody Map<String, Object> userData, HttpSession session) {
        try {
            // Obter o usuário da sessão atual
            Usuario usuario = (Usuario) session.getAttribute("usuario");
            
            if (usuario == null) {
                return ResponseEntity.status(401).body("Usuário não está autenticado");
            }
            
            // Atualizar os dados do usuário na sessão
            usuario.setNome((String) userData.get("nome"));
            usuario.setEmail((String) userData.get("email"));
            usuario.setPais((String) userData.get("pais"));
            usuario.setEstado((String) userData.get("estado"));
            usuario.setCidade((String) userData.get("cidade"));
            
            // Atualizar a sessão com o usuário modificado
            session.setAttribute("usuario", usuario);
            
            return ResponseEntity.ok("Sessão atualizada com sucesso");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao atualizar sessão: " + e.getMessage());
        }
    }
}
