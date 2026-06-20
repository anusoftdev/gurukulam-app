FROM amazoncorretto:17-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY pom.xml .
# Download dependencies first (Docker layer cache)
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM amazoncorretto:17-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
