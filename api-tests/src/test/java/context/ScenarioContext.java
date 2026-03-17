package context;

import io.restassured.response.Response;
import java.util.HashMap;
import java.util.Map;

public class ScenarioContext {

    private final Map<String, Object> data = new HashMap<>();
    private Response lastResponse;

    public void set(String key, Object value) {
        data.put(key, value);
    }

    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        return (T) data.get(key);
    }

    public String getString(String key) {
        return (String) data.get(key);
    }

    public void setLastResponse(Response response) {
        this.lastResponse = response;
    }

    public Response getLastResponse() {
        return lastResponse;
    }
}
