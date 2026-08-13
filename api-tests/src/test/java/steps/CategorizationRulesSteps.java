package steps;

import config.ApiConfig;
import context.ScenarioContext;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;

public class CategorizationRulesSteps {

    private final ScenarioContext ctx;

    public CategorizationRulesSteps(ScenarioContext ctx) {
        this.ctx = ctx;
    }

    @When("a categorization rule is saved for merchant {string} with category {string}")
    public void aCategorizationRuleIsSavedForMerchantWithCategory(String merchant, String category) {
        Response response = saveRule(merchant, category);
        ctx.setLastResponse(response);
        if (response.statusCode() == 200) {
            ctx.set("ruleId", response.jsonPath().getString("id"));
        }
    }

    @Given("a categorization rule exists for merchant {string} with category {string}")
    public void aCategorizationRuleExistsForMerchantWithCategory(String merchant, String category) {
        Response response = saveRule(merchant, category);
        assertThat(response.statusCode(), is(200));
        ctx.set("ruleId", response.jsonPath().getString("id"));
    }

    @When("all categorization rules are listed")
    public void allCategorizationRulesAreListed() {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.CATEGORIZATION_RULES_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("categorization rules are listed without authentication")
    public void categorizationRulesAreListedWithoutAuthentication() {
        Response response = RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .header("X-Internal-Secret", ApiConfig.INTERNAL_SECRET)
            .when()
                .get(ApiConfig.CATEGORIZATION_RULES_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the rule is updated to merchant {string}, category {string}")
    public void theRuleIsUpdatedToMerchantCategory(String merchant, String category) {
        ctx.setLastResponse(updateRule(ctx.getString("ruleId"), merchant, category));
    }

    @When("the rule {string} is updated to merchant {string}, category {string}")
    public void theRuleLiteralIsUpdatedToMerchantCategory(String ruleId, String merchant, String category) {
        ctx.setLastResponse(updateRule(ruleId, merchant, category));
    }

    @When("the {string} rule is renamed to merchant {string}, category {string}")
    public void theNamedRuleIsRenamedToMerchantCategory(String currentMerchant, String newMerchant, String newCategory) {
        Response listResponse = RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.CATEGORIZATION_RULES_PATH)
            .then()
                .extract().response();
        List<Map<String, Object>> rules = listResponse.jsonPath().getList("$");
        String id = rules.stream()
            .filter(rule -> currentMerchant.equals(rule.get("merchant")))
            .map(rule -> (String) rule.get("id"))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("No rule found for merchant " + currentMerchant));
        ctx.setLastResponse(updateRule(id, newMerchant, newCategory));
    }

    @When("the rule is deleted")
    public void theRuleIsDeleted() {
        ctx.setLastResponse(deleteRule(ctx.getString("ruleId")));
    }

    @When("the rule {string} is deleted")
    public void theRuleLiteralIsDeleted(String ruleId) {
        ctx.setLastResponse(deleteRule(ruleId));
    }

    @When("a categorization rule is saved without a merchant")
    public void aCategorizationRuleIsSavedWithoutAMerchant() {
        Map<String, Object> body = new HashMap<>();
        body.put("category", "Other");
        ctx.setLastResponse(putRule(body));
    }

    @When("a categorization rule is saved without a category")
    public void aCategorizationRuleIsSavedWithoutACategory() {
        Map<String, Object> body = new HashMap<>();
        body.put("merchant", "Unnamed Merchant");
        ctx.setLastResponse(putRule(body));
    }

    @Then("the rule merchant is {string}")
    public void theRuleMerchantIs(String expectedMerchant) {
        assertThat(ctx.getLastResponse().jsonPath().getString("merchant"), is(expectedMerchant));
    }

    @Then("the rule category is {string}")
    public void theRuleCategoryIs(String expectedCategory) {
        assertThat(ctx.getLastResponse().jsonPath().getString("category"), is(expectedCategory));
    }

    @Then("the rule list includes merchant {string}")
    public void theRuleListIncludesMerchant(String merchant) {
        List<String> merchants = ctx.getLastResponse().jsonPath().getList("merchant");
        assertThat(merchants, hasItem(merchant));
    }

    @Then("the rule list has {int} rule")
    public void theRuleListHasRule(int count) {
        assertThat(ctx.getLastResponse().jsonPath().getList("$").size(), is(count));
    }

    private Response saveRule(String merchant, String category) {
        Map<String, Object> body = new HashMap<>();
        body.put("merchant", merchant);
        body.put("category", category);
        return putRule(body);
    }

    private Response putRule(Map<String, Object> body) {
        return RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .put(ApiConfig.CATEGORIZATION_RULES_PATH)
            .then()
                .extract().response();
    }

    private Response updateRule(String ruleId, String merchant, String category) {
        Map<String, Object> body = new HashMap<>();
        body.put("merchant", merchant);
        body.put("category", category);
        return RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .patch(ApiConfig.CATEGORIZATION_RULES_PATH + "/" + ruleId)
            .then()
                .extract().response();
    }

    private Response deleteRule(String ruleId) {
        return RestAssured
            .given(baseRequest())
            .when()
                .delete(ApiConfig.CATEGORIZATION_RULES_PATH + "/" + ruleId)
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
