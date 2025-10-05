CREATE DATABASE evora;
USE evora;

CREATE TABLE Instituicao (
    idInstituicao INT NOT NULL PRIMARY KEY auto_increment,
    nome VARCHAR(45) NOT NULL,
    uf CHAR(2) NOT NULL,
    idMunicipio INT NOT NULL
);

CREATE TABLE Curso (
    idCurso INT NOT NULL,
    fkInstituicao INT NOT NULL,
    descricao VARCHAR(100) NULL,
    modalidade VARCHAR(40) NULL,
    PRIMARY KEY (idCurso, fkInstituicao),
    FOREIGN KEY (fkInstituicao)
        REFERENCES Instituicao (idInstituicao)
);

CREATE TABLE Usuario (
    idUsuario INT NOT NULL,
    fkInstituicao INT NOT NULL,
    cargo VARCHAR(45) NOT NULL,
    email VARCHAR(100) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(200) NOT NULL,
    PRIMARY KEY (idUsuario, fkInstituicao),
    UNIQUE (senha),
    FOREIGN KEY (fkInstituicao)
        REFERENCES Instituicao (idInstituicao)
);

CREATE TABLE Disciplina (
    idDisciplina INT NOT NULL PRIMARY KEY,
    nome VARCHAR(45) NULL,
    descricao VARCHAR(100) NULL
);

CREATE TABLE Aluno (
    RA INT NOT NULL,
    fkInstituicao INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    PRIMARY KEY (RA, fkInstituicao)
);

CREATE TABLE grade_curricular (
    fkDisciplina INT NOT NULL,
    fkCurso INT NOT NULL,
    fkInstituicao INT NOT NULL,
    carga_horaria INT NOT NULL,
    PRIMARY KEY (fkDisciplina, fkCurso, fkInstituicao),
    FOREIGN KEY (fkDisciplina)
        REFERENCES Disciplina (idDisciplina),
    FOREIGN KEY (fkCurso, fkInstituicao)
        REFERENCES Curso (idCurso, fkInstituicao)
);

CREATE TABLE Desempenho (
    fkDisciplina INT NOT NULL,
    fkAluno INT NOT NULL,
    fkInstituicao INT NOT NULL,
    frequencia DOUBLE NOT NULL,
    nota DOUBLE NOT NULL,
    PRIMARY KEY (fkDisciplina, fkAluno, fkInstituicao),
    FOREIGN KEY (fkDisciplina)
        REFERENCES Disciplina (idDisciplina),
    FOREIGN KEY (fkAluno, fkInstituicao)
        REFERENCES Aluno (RA, fkInstituicao)
);

CREATE TABLE Matricula (
    idMatricula INT NOT NULL,
    fkRA INT NOT NULL,
    Aluno_fkInstituicao INT NOT NULL,
    Curso_fkCurso INT NOT NULL,
    Curso_fkInstituicao INT NOT NULL,
    PRIMARY KEY (idMatricula, fkRA, Aluno_fkInstituicao, Curso_fkCurso, Curso_fkInstituicao),
    FOREIGN KEY (fkRA, Aluno_fkInstituicao)
        REFERENCES Aluno (RA, fkInstituicao),
    FOREIGN KEY (Curso_fkCurso, Curso_fkInstituicao)
        REFERENCES Curso (idCurso, fkInstituicao)
);

