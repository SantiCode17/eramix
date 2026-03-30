FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S eramix && adduser -S eramix -G eramix
COPY --from=build /app/target/*.jar app.jar
RUN chown eramix:eramix app.jar
USER eramix
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
