package steps;

import config.ApiConfig;
import context.ScenarioContext;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;

public class AutoCategorizeSteps {

    private static final List<String> ALLOWED_CATEGORIES = Arrays.asList(
        "Groceries", "Rent", "Utilities", "Transport", "Dining", "Shopping",
        "Healthcare", "Entertainment", "Other", "Salary", "Freelance", "Gift",
        "Investment", "Other Income"
    );

    private final ScenarioContext ctx;

    public AutoCategorizeSteps(ScenarioContext ctx) {
        this.ctx = ctx;
    }

    @When("merchant suggestions are requested for {string}")
    public void merchantSuggestionsAreRequestedFor(String commaSeparatedMerchants) {
        List<String> merchants = new ArrayList<>();
        if (!commaSeparatedMerchants.isEmpty()) {
            for (String merchant : commaSeparatedMerchants.split(",")) {
                merchants.add(merchant.trim());
            }
        }
        Map<String, Object> body = new HashMap<>();
        body.put("merchants", merchants);
        ctx.setLastResponse(requestSuggestions(body));
    }

    @When("merchant suggestions are requested for {int} merchants")
    public void merchantSuggestionsAreRequestedForNMerchants(int count) {
        List<String> merchants = new ArrayList<>();
        for (int index = 0; index < count; index++) {
            merchants.add("Merchant " + index);
        }
        Map<String, Object> body = new HashMap<>();
        body.put("merchants", merchants);
        ctx.setLastResponse(requestSuggestions(body));
    }

    @When("merchant suggestions are requested with no merchants field")
    public void merchantSuggestionsAreRequestedWithNoMerchantsField() {
        ctx.setLastResponse(requestSuggestions(new HashMap<>()));
    }

    @When("merchant suggestions are requested with a blank merchant in the list")
    public void merchantSuggestionsAreRequestedWithABlankMerchantInTheList() {
        Map<String, Object> body = new HashMap<>();
        body.put("merchants", Arrays.asList("Walmart", "   "));
        ctx.setLastResponse(requestSuggestions(body));
    }

    @When("merchant suggestions are requested without authentication")
    public void merchantSuggestionsAreRequestedWithoutAuthentication() {
        Map<String, Object> body = new HashMap<>();
        body.put("merchants", Arrays.asList("Walmart"));
        Response response = RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .header("X-Internal-Secret", ApiConfig.INTERNAL_SECRET)
                .body(body)
            .when()
                .post(ApiConfig.AUTO_CATEGORIZE_PATH + "/suggest")
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @Then("every suggestion has an allowed category")
    public void everySuggestionHasAnAllowedCategory() {
        List<Map<String, Object>> suggestions = ctx.getLastResponse().jsonPath().getList("suggestions");
        assertThat(suggestions, not(is(empty())));
        boolean allAllowed = suggestions.stream()
            .allMatch(suggestion -> ALLOWED_CATEGORIES.contains(suggestion.get("category")));
        assertThat("Every suggestion should use an allowed category", allAllowed, is(true));
    }

    private Response requestSuggestions(Map<String, Object> body) {
        return RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .post(ApiConfig.AUTO_CATEGORIZE_PATH + "/suggest")
            .then()
                .extract().response();
    }

    private RequestSpecification baseRequest() {
        return RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .header("X-User-Id", ctx.getUserId())
                .header("X-Internal-Secret", ApiConfig.INTERNAL_SECRET);
    }
}
