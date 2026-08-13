package steps;

import config.ApiConfig;
import context.ScenarioContext;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class ProfileSteps {

    private final ScenarioContext ctx;

    public ProfileSteps(ScenarioContext ctx) {
        this.ctx = ctx;
    }

    @When("the current profile is fetched")
    public void theCurrentProfileIsFetched() {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.PROFILE_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the profile is saved with first name {string}, last name {string}, username {string}, and email {string}")
    public void theProfileIsSavedWith(String firstName, String lastName, String username, String email) {
        Map<String, String> body = new HashMap<>();
        body.put("firstName", firstName);
        body.put("lastName", lastName);
        body.put("username", username);
        body.put("email", email);

        Response response = RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .put(ApiConfig.PROFILE_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the profile is saved with first name {string}, last name {string}, and a unique username")
    public void theProfileIsSavedWithAUniqueUsername(String firstName, String lastName) {
        String username = "p_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        String email = username + "@example.com";
        ctx.set("profileUsername", username);
        theProfileIsSavedWith(firstName, lastName, username, email);
    }

    @When("another user saves a profile with username {string}")
    public void anotherUserSavesAProfileWithUsername(String username) {
        String base = username.toLowerCase().replaceAll("[^a-z0-9_]", "");
        if (base.length() > 15) {
            base = base.substring(0, 15);
        }
        String uniqueUsername = base + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 4);
        Map<String, String> body = new HashMap<>();
        body.put("firstName", "Other");
        body.put("lastName", "User");
        body.put("username", uniqueUsername);
        body.put("email", uniqueUsername + "@example.com");

        Response response = RestAssured
            .given(baseRequest("api-test-" + UUID.randomUUID()))
                .body(body)
            .when()
                .put(ApiConfig.PROFILE_PATH)
            .then()
                .extract().response();
        ctx.set("duplicateSeedUsername", uniqueUsername);
        ctx.setLastResponse(response);
    }

    @When("the current user attempts to save a duplicate username")
    public void theCurrentUserAttemptsToSaveADuplicateUsername() {
        String username = ctx.getString("duplicateSeedUsername");
        Map<String, String> body = new HashMap<>();
        body.put("firstName", "Current");
        body.put("lastName", "User");
        body.put("username", username);
        body.put("email", "current." + username + "@example.com");

        Response response = RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .put(ApiConfig.PROFILE_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @Then("the profile response is null")
    public void theProfileResponseIsNull() {
        assertThat(ctx.getLastResponse().asString(), is("null"));
    }

    @Then("the profile first name is {string}")
    public void theProfileFirstNameIs(String expectedFirstName) {
        assertThat(ctx.getLastResponse().jsonPath().getString("firstName"), is(expectedFirstName));
    }

    @Then("the profile username is {string}")
    public void theProfileUsernameIs(String expectedUsername) {
        assertThat(ctx.getLastResponse().jsonPath().getString("username"), is(expectedUsername));
    }

    @Then("the profile username matches the saved username")
    public void theProfileUsernameMatchesTheSavedUsername() {
        assertThat(ctx.getLastResponse().jsonPath().getString("username"), is(ctx.getString("profileUsername")));
    }

    private RequestSpecification baseRequest() {
        return baseRequest(ctx.getUserId());
    }

    private RequestSpecification baseRequest(String userId) {
        return RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .header("X-User-Id", userId)
                .header("X-Internal-Secret", ApiConfig.INTERNAL_SECRET);
    }
}
