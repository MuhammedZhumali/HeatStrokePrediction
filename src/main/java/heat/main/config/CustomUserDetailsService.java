package heat.main.config;

import heat.main.domain.User;
import heat.main.users.repository.UserRepository;
import heat.main.users.service.UserSerivce;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String raw) throws UsernameNotFoundException {
        String key = raw == null ? "" : raw.trim();
        User u = userRepository
                .findByEmailIgnoreCaseOrNameIgnoreCase(key, key)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + raw));

        return org.springframework.security.core.userdetails.User
                .withUsername(u.getName())
                .password(u.getPassword())
                .authorities("ROLE_" + u.getRoleType().name())
                .build();
    }
}
