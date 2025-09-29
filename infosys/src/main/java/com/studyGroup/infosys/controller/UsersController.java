package com.studyGroup.infosys.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studyGroup.infosys.entity.User;
import com.studyGroup.infosys.entity.UsersManager;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UsersController 
{
	@Autowired
	UsersManager UM;
	
	@PostMapping("/signup")
    public String signup(@RequestBody User U)
    {
		return UM.addUsers(U) ; 
    }
	
	@GetMapping("/forgetpassword/{email}")
	public String forgetpassword(@PathVariable("email") String emailid) 
	{
		return UM.recoverPassword(emailid);
	}
	
	@PostMapping("/signin")
	public  String signin(@RequestBody User U) 
	{
		
	    return UM.validateCredentials(U.getEmail(), U.getPassword());
		
	}
	
	@PostMapping("/getfullname")
	public String getFullname(@RequestBody Map<String,String> data ) 
	{
		return UM.getFullname(data.get("csrid"));
	}
	
	@PostMapping("/profile")
	public User getProfile(@RequestBody Map<String, String> data) {
	    String token = data.get("csrid");
	    return UM.getUserProfile(token);
	}
    
	@PostMapping("/getemail")
	public String getEmail(@RequestBody Map<String,String> data) {
	    return UM.getEmail(data.get("csrid"));
	}


}
