import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.experimental.PackagePrivate;

@Data
public class RegisterDto{

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastname;

    @NotBlank
    @Email
    @Pattern(regexp=".+@gmail\\.com$",message="Email must be a gmail.com address")
    private String email;

    @NotBlank
    @Pattern(regexp="^[0-9]{10}$",message="Mobile number must be exactly 10 digits")
    private String phone;

    @NotBlank
    private String city;

    @NotBlank
    @Pattern(regexp="[0-9]{6}$",message="Pincode must be exactly 6 digit")
    private String pincode;

    @NotNull(message="Secondary school percentage")
    @DecimalMin(value="0.0",message="percentage must not be less than 0")
    @DecimalMax(value="100.0",message="percentage cannot be more than 100")
    @Digits(integer=3,fraction=2,message="Invalid entry")
    private BigDecimal secondarySchoolPercentage;
    
    @NotNull(message="higher secondary school percentage is required")
    @DecimalMin(value="0.0",message="don't enter non-negative")
    @DecimalMax(value="100.0",message="percentage should not be greater than 100")
    @Digits(integer=3,fraction=2,message="Invalid Percentage")
    private BigDecimal higherSecondaryPercentage;

    @NotBlank
    @Size(min=6,message="Password must be atleast 6 character")
    private String password; 

}