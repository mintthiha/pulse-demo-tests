package config;

public class ApiConfig {

    public static final String BASE_URL =
        System.getProperty("bloom.api.url",
            System.getenv().getOrDefault("BLOOM_API_URL", "http://localhost:3001"));

    public static final String ACCOUNTS_PATH = "/api/accounts";
    public static final String BUDGETS_PATH = "/api/budgets";
    public static final String PROFILE_PATH = "/api/profile";
    public static final String RECURRING_PATH = "/api/recurring";

    private ApiConfig() {}
}
