# StockVault Simulator

<div align="center">

![Java](https://img.shields.io/badge/Java-25-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-3.9-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![H2](https://img.shields.io/badge/H2_Database-In--Memory-003545?style=for-the-badge&logo=h2&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A full-stack virtual stock trading platform built as a Java laboratory project.**  
Backend powered entirely by Java 25 + Spring Boot. Frontend in React + Vite.

[Run Locally](#-local-deployment) · [Architecture](#-java-backend-architecture) · [API Docs](#-rest-api-reference) · [Report Bug](../../issues)

</div>

---

## 📚 Table of Contents

1. [Project Overview](#-project-overview)
2. [Java Backend Architecture](#-java-backend-architecture)
3. [Spring Boot Services](#-spring-boot-services)
4. [Market Engine & Pricing Model](#-market-engine--pricing-model)
5. [REST API Reference](#-rest-api-reference)
6. [Database Layer (JPA + H2/MySQL)](#-database-layer-jpa--h2mysql)
7. [Performance Optimizations](#-performance-optimizations)
8. [Local Deployment](#-local-deployment)
9. [Tech Stack](#-tech-stack)

---

## 🧪 Project Overview

**StockVault Simulator** is a **Java lab project** developed to demonstrate enterprise-grade backend engineering with the Spring ecosystem. It simulates a live stock market environment — complete with real-time price ticks, portfolio management, AI-assisted trading advice, and transaction history — with a Java 25 backend driving all business logic.

This project was built as part of a **Java programming laboratory** to explore:

- **Spring Boot** application structure and dependency injection
- **JPA/Hibernate** ORM with both in-memory (H2) and persistent (MySQL) databases
- **RESTful API design** with Spring MVC
- **Concurrency** via scheduled tasks for real-time market ticks
- **Spring Security** for session-based authentication
- **Maven** multi-module project structure

---

## ☕ Java Backend Architecture

The backend is a **Java 25 Spring Boot monolith** structured as a Maven project. Every piece of business logic — from price calculations to portfolio management — is written in Java.

```
stock-market-service/
├── src/main/java/
│   └── com/stockvault/
│       ├── StockVaultApplication.java       ← @SpringBootApplication entry point
│       ├── config/
│       │   ├── SecurityConfig.java          ← Spring Security configuration
│       │   └── WebConfig.java               ← CORS, MVC settings
│       ├── controller/
│       │   ├── StockController.java         ← GET /api/stocks/**
│       │   ├── PortfolioController.java     ← POST /api/portfolio/**
│       │   ├── TransactionController.java   ← GET /api/transactions
│       │   └── AuthController.java          ← POST /api/auth/**
│       ├── service/
│       │   ├── StockService.java            ← Core market logic (Java)
│       │   ├── PortfolioService.java        ← P&L calculations in Java
│       │   ├── PricingEngine.java           ← Scheduled price updates
│       │   └── AuthService.java             ← Login / session management
│       ├── model/
│       │   ├── Stock.java                   ← @Entity — JPA mapped stock
│       │   ├── Portfolio.java               ← @Entity — user holdings
│       │   ├── Transaction.java             ← @Entity — trade records
│       │   └── User.java                    ← @Entity — authenticated user
│       ├── repository/
│       │   ├── StockRepository.java         ← extends JpaRepository<Stock, Long>
│       │   ├── PortfolioRepository.java
│       │   └── TransactionRepository.java
│       └── dto/
│           ├── TradeRequest.java            ← Request DTO (buy/sell)
│           └── StockResponse.java           ← Response DTO
└── src/main/resources/
    ├── application.properties               ← Default (MySQL / Docker)
    ├── application-local.properties         ← H2 in-memory (local dev)
    └── data.sql                             ← Seed data for H2
```

### Key Java Design Patterns Used

| Pattern | Where Applied |
|---|---|
| **Dependency Injection** | All `@Service` / `@Repository` beans via `@Autowired` |
| **Repository Pattern** | `JpaRepository` extensions for each entity |
| **DTO Pattern** | Separate request/response objects to decouple API from DB layer |
| **Scheduled Tasks** | `@Scheduled` in `PricingEngine.java` for market ticks |
| **Builder Pattern** | Lombok `@Builder` on entity classes |
| **Strategy Pattern** | Interchangeable pricing factor strategies |

---

## 🌱 Spring Boot Services

### StockService.java
The core Java service. Maintains an in-memory `ConcurrentHashMap<String, Stock>` cache for O(1) price lookups. Interacts with `StockRepository` (JPA) for persistence.

```java
@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final ConcurrentHashMap<String, Stock> stockCache = new ConcurrentHashMap<>();

    public List<Stock> getAllStocks() {
        return new ArrayList<>(stockCache.values());
    }

    public Stock getStock(String ticker) {
        return stockCache.getOrDefault(ticker,
            stockRepository.findByTicker(ticker)
                .orElseThrow(() -> new StockNotFoundException(ticker)));
    }

    public void updatePrice(String ticker, double newPrice) {
        stockCache.computeIfPresent(ticker, (k, stock) -> {
            stock.setPrice(newPrice);
            return stock;
        });
    }
}
```

### PricingEngine.java
Runs on a `@Scheduled` fixed-rate task. Every tick, it iterates all stocks, applies the **6-factor pricing formula** (see below), and pushes updates via SSE or WebSocket.

```java
@Component
@RequiredArgsConstructor
public class PricingEngine {

    private final StockService stockService;
    private final NewsService newsService;

    @Scheduled(fixedRate = 3000) // 3-second market tick
    public void tick() {
        stockService.getAllStocks().forEach(stock -> {
            double delta = calculateDelta(stock);
            double newPrice = Math.max(0.01, stock.getPrice() + delta);
            stockService.updatePrice(stock.getTicker(), newPrice);
        });
    }

    private double calculateDelta(Stock stock) {
        // 6-factor model — all Java arithmetic
        double signal   = Math.tanh((stock.getFactorValue() * stock.getFactorWeight()) / 35.0);
        double noise    = stock.getVolatilityFactor() + stock.getBaseNoise();
        double sigma    = Math.max(0.05, noise * (1 - 0.7 * Math.abs(signal)));
        double randNoise = (Math.random() * 2 - 1) * sigma;
        double dampener = 1.0 / (1 + Math.pow(stock.getPrice() / 10_000.0, 1.5));
        return ((signal * 0.06 + randNoise) * stock.getPrice() * dampener) / 800.0;
    }
}
```

---

## 📈 Market Engine & Pricing Model

The market engine runs entirely in Java and uses a **6-factor stochastic pricing model**:

| Factor | Description | Java Field |
|---|---|---|
| **Investor Confidence** | Long-term company health sentiment | `investorConfidence` (double) |
| **Trading Demand** | Short-term buy/sell pressure | `tradingDemand` (double) |
| **Liquidity** | Availability of shares for trading | `liquidity` (double) |
| **News Sentiment** | Decaying influence of news events | `newsSentiment` (double) |
| **Innovation Potential** | Growth sector confidence | `innovationPotential` (double) |
| **Volatility Noise** | Randomized price fluctuation | `volatility` (enum: STABLE→EXTREME) |

### Pricing Formula (Java Implementation)

```java
// Pricing delta for one market tick — computed per stock in Java
double newPrice = currentPrice
    + investorConfidenceDelta(stock)
    + tradingDemandDelta(stock)
    + liquidityDelta(stock)
    + newsSentimentDelta(stock)
    + innovationDelta(stock);

// Factor delta formula
double factorDelta(double factorValue, double weight, double price, double volatility) {
    double scaledSignal = Math.tanh((factorValue * weight) / 35.0); // ∈ (-1, 1)
    double sigma = Math.max(0.05, volatility * (1 - 0.7 * Math.abs(scaledSignal)));
    double noise = (Math.random() * 2 - 1) * sigma;
    double dampener = 1.0 / (1 + Math.pow(price / 10_000.0, 1.5));
    return ((scaledSignal * 0.06 + noise) * price * dampener) / 800.0;
}
```

---

## 🔗 REST API Reference

All endpoints are served by **Spring MVC controllers** on `http://localhost:8000`.

| Method | Endpoint | Controller | Description |
|---|---|---|---|
| `GET` | `/api/stocks` | `StockController` | List all stocks with live prices |
| `GET` | `/api/stocks/{ticker}` | `StockController` | Single stock details |
| `POST` | `/api/portfolio/buy` | `PortfolioController` | Execute a BUY trade |
| `POST` | `/api/portfolio/sell` | `PortfolioController` | Execute a SELL trade |
| `GET` | `/api/portfolio` | `PortfolioController` | Get user's holdings |
| `GET` | `/api/transactions` | `TransactionController` | Full trade history |
| `POST` | `/api/auth/login` | `AuthController` | Login (session-based) |
| `POST` | `/api/auth/logout` | `AuthController` | Invalidate session |
| `GET` | `/api/market/indices` | `MarketController` | Index fund snapshots |

> Full Swagger/OpenAPI docs: `http://localhost:8000/swagger-ui/index.html`

---

## 🗄 Database Layer (JPA + H2/MySQL)

The project supports **two database profiles**:

### Local Development — H2 In-Memory (default for lab use)
```properties
# application-local.properties
spring.datasource.url=jdbc:h2:mem:stockvault;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

Run with: `mvn spring-boot:run -Dspring-boot.run.profiles=local`

### Production — MySQL via Docker
```properties
# application-docker.properties
spring.datasource.url=jdbc:mysql://mysql:3306/stockvault
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```

### JPA Entity Example (Java)

```java
@Entity
@Table(name = "stocks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 10)
    private String ticker;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private double price;

    @Enumerated(EnumType.STRING)
    private Volatility volatility;  // STABLE, LOW, NORMAL, HIGH, EXTREME

    @Column(nullable = false)
    private String sector;

    @OneToMany(mappedBy = "stock", cascade = CascadeType.ALL)
    private List<Transaction> transactions;
}
```

---

## ⚡ Performance Optimizations

### ConcurrentHashMap Stock Cache
All stock reads bypass the database and hit the Java in-memory cache:

```java
// O(1) lookup — no DB round-trip for price reads
private final ConcurrentHashMap<String, Stock> stockCache = new ConcurrentHashMap<>();
```
Before caching: **~7–8 sec/tick**. After: **~80 ms/tick**.

### Async Price Broadcasting
Spring's `@Async` enables non-blocking price push to connected clients, keeping the pricing engine thread free.

### Pricing Record Archival
End-of-day and intra-day records are archived to CSV on a rolling monthly basis using a Java `@Scheduled` job, preventing unbounded DB growth.

---

## 🚀 Local Deployment

### Prerequisites
| Requirement | Version |
|---|---|
| **JDK** | 25 (OpenJDK recommended) |
| **Maven** | 3.9+ |
| **Node.js** | 18+ (for React frontend) |
| **Docker Desktop** | Optional (for MySQL profile) |

### Quick Start (H2 — No Docker needed)

```bash
# 1. Clone the repository
git clone https://github.com/tiyamisu/StockVaultSimulator.git
cd StockVaultSimulator

# 2. Run the Java backend (H2 in-memory DB)
cd stock-market-service
mvn spring-boot:run -Dspring-boot.run.profiles=local
# Backend available at http://localhost:8000
# H2 Console at http://localhost:8000/h2-console

# 3. Run the React frontend (new terminal)
cd ../frontend
npm install
npm run dev
# Frontend available at http://localhost:5173
```

**Demo credentials:** `demo` / `demo123`

### Full Stack with Docker (MySQL)

```bash
# Requires Docker Desktop
docker-compose up --build

# To stop
docker-compose down
```

### Maven Commands

```bash
# Build the Java project
mvn clean package

# Run tests
mvn test

# Skip tests and build JAR
mvn clean package -DskipTests

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

---

## 🛠 Tech Stack

| Layer | Technology | Language |
|---|---|---|
| **Backend Runtime** | Java 25 (OpenJDK) | ☕ Java |
| **Web Framework** | Spring Boot 3.x | ☕ Java |
| **ORM** | Spring Data JPA / Hibernate | ☕ Java |
| **Build Tool** | Apache Maven 3.9 | XML / ☕ Java |
| **Security** | Spring Security | ☕ Java |
| **Dev Database** | H2 In-Memory | SQL |
| **Prod Database** | MySQL 8 (Docker) | SQL |
| **API Docs** | SpringDoc OpenAPI / Swagger | ☕ Java |
| **Frontend** | React 18 + Vite | JavaScript |
| **Styling** | Vanilla CSS (Digital Atelier theme) | CSS |
| **Containerization** | Docker + Docker Compose | YAML |

---

<div align="center">

**StockVault Simulator** · Java Lab Project · MIT License

Built with ☕ Java 25 + Spring Boot

</div>
