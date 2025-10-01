package com.studyGroup.infosys.model; 

import jakarta.persistence.Entity; 
import jakarta.persistence.Id;     
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity 
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Course {

    @Id 
    private String courseId;
    
    private String courseName;
    private String instructor;
    private String description;
}

