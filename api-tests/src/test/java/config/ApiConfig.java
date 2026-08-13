package config;

public class ApiConfig {

    public static final String BASE_URL =
        System.getProperty("bloom.api.url",
            System.getenv().getOrDefault("BLOOM_API_URL", "http://localhost:3001"));

    // Shared secret the backend's requireInternalSecret middleware checks on every /api/* request.
    // Must match the INTERNAL_API_SECRET the backend under test was started with.
    public static final String INTERNAL_SECRET =
        System.getProperty("bloom.api.secret",
            System.getenv().getOrDefault("BLOOM_API_SECRET", "local-dev-secret"));

    public static final String ACCOUNTS_PATH = "/api/accounts";
    public static final String BUDGETS_PATH = "/api/budgets";
    public static final String PROFILE_PATH = "/api/profile";
    public static final String RECURRING_PATH = "/api/recurring";
    public static final String CATEGORIZATION_RULES_PATH = "/api/categorization-rules";
    public static final String SAVINGS_GOALS_PATH = "/api/savings-goals";
    public static final String NOTIFICATIONS_PATH = "/api/notifications";
    public static final String SUBSCRIPTIONS_PATH = "/api/subscriptions";
    public static final String AUTO_CATEGORIZE_PATH = "/api/auto-categorize";

    private ApiConfig() {}
}
