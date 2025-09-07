package sptech.school;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Metodos {

    //throws InterruptedException -> indica que o código pode ser interrompido no meio
    List<String> criarLog() throws InterruptedException{

        //Importe do Scanner
        Scanner in = new Scanner(System.in);

        //Criando uma lista para inserir os logs
        List<String> logs = new ArrayList<>();

        //Variavel feita para a escolha do usuario
        Integer continuar = 2;

        //Faça...
        do {

            System.out.println("Crie um log nesse molde\n[NÍVEL] SERVIÇO/COMPONENTE Mensagem - Detalhes");

            //Guarda o log feito em uma String
            String log = in.nextLine();

            //Guarda essa String na lista de logs
            logs.add(log);

            System.out.println("\n");

            //Printa os logs já feitos
            printLog(logs);

            System.out.println("\n");

            System.out.println("Deseja adicionar mais um log?Digite\n1 para Sim\n2 para Não");

            continuar = in.nextInt();
            in.nextLine();

            System.out.println("\n");

        }while (continuar.equals(1));//Enquanto

        return logs;
    };


    void printLog(List<String> logs) throws InterruptedException {

        //molde do formato da data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        //(String log : logs) -> cria uma String chamada log para cada elemento do vetor
        for (String log : logs) {

            //pega a data e hora atual, e salva de acordo com o molde de formato
            String data = LocalDateTime.now().format(formatter);

            System.out.println(data + " " + log);

            // espera 1 segundo antes de imprimir a próxima linha
            Thread.sleep(1000);
        }

    }

    //throws InterruptedException -> indica que o código pode ser interrompido no meio
    void printLog(String[] logs) throws InterruptedException {

        //molde do formato da data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        //(String log : logs) -> cria uma String chamada log para cada elemento do vetor
        for (String log : logs) {

            //pega a data e hora atual, e salva de acordo com o molde de formato
            String data = LocalDateTime.now().format(formatter);

            System.out.println(data + " " + log);

            // espera 1 segundo antes de imprimir a próxima linha
            Thread.sleep(1000);
        }

    }

}
