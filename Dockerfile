# Usaremos uma imagem oficial do Maven para compilar
FROM maven:3.9.3-eclipse-temurin-17 AS build
WORKDIR /app

# Copia o pom.xml e o código fonte para dentro do container
COPY pom.xml ./
COPY src ./src

# Faz o download das dependências e compila o projeto
RUN mvn clean package -DskipTests

# A JAR resultante estará em target/*.jar, assumindo que seu pom gera um jar
# Subimos uma imagem leve para rodar
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copia o jar compilado do estágio anterior
COPY --from=build /app/target/SunnyTrips-0.0.1-SNAPSHOT.jar app.jar

# Define a porta de execução
EXPOSE 8080

# Se preferir, pode usar ENTRYPOINT
ENTRYPOINT ["java","-jar","/app/app.jar"]
