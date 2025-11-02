package heat.main.config;

import heat.main.domain.User;
import heat.main.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

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
