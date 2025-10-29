package heat.main.users.service;

import heat.main.domain.User;
import heat.main.enums.RoleType;
import heat.main.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserSerivce {
    
    private final UserRepository userRepository;

    @Override
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    @Override
    public List<User> getAllUsersByRole(RoleType roleType) {
        return userRepository.findByRoleType(roleType);
    }

    @Override
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<User> findUserByPhoneAndRole(String phone, RoleType roleType) {
        return userRepository.findByPhoneNumberAndRoleType(phone, roleType);
    }

    @Override
    public User addUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User user) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User updatedUser = existingUser.get();

            // Update only the fields that are not null
            if (user.getName() != null) {
                updatedUser.setName(user.getName());
            }
            if (user.getPhoneNumber() != null) {
                updatedUser.setPhoneNumber(user.getPhoneNumber());
            }
            if (user.getRoleType() != null) {
                updatedUser.setRoleType(user.getRoleType());
            }
            if (user.getEmail() != null) {
                updatedUser.setEmail(user.getEmail());
            }
            if(user.getWeight()!=null){
                updatedUser.setWeight(user.getWeight());
            }
            if(user.getHeight()!=null){
                updatedUser.setHeight(user.getHeight());
            }
            if(user.getBmi()!=null){
                updatedUser.setBmi(user.getBmi());
            }

            return userRepository.save(updatedUser);
        } else {
            throw new RuntimeException("User not found with id " + id);
        }
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

}
