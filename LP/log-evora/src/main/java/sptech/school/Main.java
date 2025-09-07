package sptech.school;

import java.util.Scanner;

public class Main {

    //throws InterruptedException -> indica que o código pode ser interrompido no meio
    public static void main(String[] args) throws InterruptedException{

        //Chamando os metodos
        Metodos metodos = new Metodos();

        //Criando o scanner
        Scanner in = new Scanner(System.in);

        //Logs pré-prontos
        String[] logs = {
                //[NÍVEL] [SERVIÇO/COMPONENTE] Mensagem - Detalhes
                "[INFO] Server started on https://evora.com",
                "[INFO] GET / 200 - 20ms - IP: 179.213.55.120",
                "[INFO] GET /login 200 - 12ms - IP: 192.168.1.10",
                "[WARN] POST /login 401 - Invalid credentials - IP: 192.168.1.10",
                "[INFO] POST /login 200 - User authenticated: professor@example.com - 30ms - IP: 192.168.1.10",
                "[INFO] GET /dashboard 200 - 25ms - IP: 192.168.1.10",
                "[ERROR] GET /api/data 500 - Internal Server Error - DB connection failed",
                "[INFO] GET /logout 200 - Session destroyed - IP: 192.168.1.10",
                "[INFO] GET / 200 - 10ms - IP: 192.168.1.10",
                "[INFO] GET /cadastro 200 - 18ms - IP: 200.100.50.25",
                "[WARN] POST /cadastro 409 - Email already in use - IP: 200.100.50.25",
                "[INFO] GET /perfil 200 - 22ms - IP: 179.213.55.120",
                "[ERROR] GET /api/estudantes 503 - Service Unavailable - IP: 179.213.55.120",
                "[INFO] GET /cursos 200 - 15ms - IP: 189.55.120.34",
                "[INFO] GET /cursos/algoritmo 200 - 19ms - IP: 189.55.120.34",
                "[WARN] GET /cursos/analise 404 - Not Found - IP: 189.55.120.34",
                "[INFO] POST /api/feedback 200 - Feedback submitted - IP: 201.22.45.66",
                "[INFO] GET /contato 200 - 14ms - IP: 201.22.45.66",
                "[INFO] GET / 200 - 11ms - IP: 179.213.55.120"
        };

        System.out.println("1.Criar logs\n2.Mostrar logs");

        if (in.nextInt()==1){

            //Cria logs e printa depois
            metodos.printLog(metodos.criarLog());

        }else {

            //Printa logs pré-prontos
            metodos.printLog(logs);

        }

    }

}
