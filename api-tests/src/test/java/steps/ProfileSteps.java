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
import static org.hamcrest.Matchers.nullValue;

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
        return RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .header("X-User-Id", ctx.getUserId());
    }
}
