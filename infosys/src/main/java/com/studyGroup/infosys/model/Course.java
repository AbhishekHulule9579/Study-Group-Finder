package com.studyGroup.infosys.model; // Added package declaration

import jakarta.persistence.Entity; // Import for @Entity
import jakarta.persistence.Id;     // Import for @Id
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The Course class represents a course entity.
 * It holds details about the course such as its ID, name, instructor,
 * and a brief description.
 * This version uses Lombok to reduce boilerplate code.
 */
@Entity // <-- Marks this class as a database entity (a table)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Course {

    @Id // <-- Marks this field as the primary key for the table
    private String courseId;
    
    private String courseName;
    private String instructor;
    private String description;
}

