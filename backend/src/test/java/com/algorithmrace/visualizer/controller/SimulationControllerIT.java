package com.algorithmrace.visualizer.controller;


import com.algorithmrace.visualizer.algorithms.sorting.SortingAlgorithmFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.fasterxml.jackson.databind.JsonNode;


import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;


import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SimulationControllerIT {

	private static final String URL = "/api/simulations/sorting";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	//happy path
	@Test
	void shouldSimulateSortingWithRandomDataset() throws Exception {
		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":["Bubble Sort"],
								  "datasetType":"Random",
								  "size":30,
								  "customArray":null
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.type").value("sorting"))
				.andExpect(jsonPath("$.dataset.length()").value(30))
				.andExpect(jsonPath("$.lanes.length()").value(1))
				.andExpect(jsonPath("$.lanes[0].frames").isArray())
				.andExpect(jsonPath("$.winner").value("Bubble Sort"));
	}

	@Test
	void shouldReturnMultipleLanes() throws Exception {
		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":["Bubble Sort","Merge Sort","Quick Sort"],
								  "datasetType":"Random",
								  "size":20
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.lanes.length()").value(3))
				.andExpect(jsonPath("$.lanes[0].complexityInfo").exists())
				.andExpect(jsonPath("$.winner").exists());
	}

	@Test
	void shouldUseCustomArrayWhenProvided() throws Exception {
		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":["Bubble Sort"],
								  "datasetType":"Random",
								  "size":30,
								  "customArray":[5,3,8,1,9]
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.dataset[0]").value(5))
				.andExpect(jsonPath("$.dataset[1]").value(3))
				.andExpect(jsonPath("$.dataset[2]").value(8))
				.andExpect(jsonPath("$.dataset.length()").value(5));
	}

	@Test
	void shouldRejectEmptyAlgorithms() throws Exception {
		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":[],
								  "datasetType":"Random",
								  "size":20
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("One invalid name among otherwise-valid names fails the entire request, not just that lane")
	void shouldFailEntireRequestWhenOneAlgorithmNameIsInvalid() throws Exception {
		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":["Bubble Sort","Bogus Sort"],
								  "datasetType":"Random",
								  "size":20
								}
								"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.error").value("Bad Request"));
	}

	@Test
	void shouldRejectInvalidSize() throws Exception {
		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":["Bubble Sort"],
								  "datasetType":"Random",
								  "size":0
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void shouldRejectTooLargeSize() throws Exception {
		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":["Bubble Sort"],
								  "datasetType":"Random",
								  "size":200
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void shouldCapGeneratedDatasetAtServiceMaximum100() throws Exception {
		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":["Bubble Sort"],
								  "datasetType":"Random",
								  "size":150
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.dataset.length()").value(100));
	}

	@Test
	void shouldLimitAlgorithmsToSix() throws Exception {
		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":[
								    "Bubble Sort",
								    "Selection Sort",
								    "Insertion Sort",
								    "Merge Sort",
								    "Quick Sort",
								    "Heap Sort",
								    "Cocktail Sort",
								    "Comb Sort"
								  ],
								  "datasetType":"Random",
								  "size":20
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.lanes.length()").value(6));
	}

	@Test
	@DisplayName("Unrecognized datasetType label falls back to RANDOM instead of erroring")
	void shouldDefaultToRandomForUnknownDatasetType() throws Exception {
		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":["Bubble Sort"],
								  "datasetType":"Not A Real Type",
								  "size":20
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.dataset.length()").value(20));
	}

	@Test
	@DisplayName("Should truncate custom array to maximum allowed size of 100 elements")
	void shouldLimitCustomArrayTo100Elements() throws Exception {
		List<Integer> customArray = new ArrayList<>();
		for (int i = 1; i <= 150; i++) {
			customArray.add(i);
		}

		String req = body(List.of("Bubble Sort"), null, 10, customArray);

		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content(req))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.dataset", hasSize(100)))
				.andExpect(jsonPath("$.dataset[0]").value(1))
				.andExpect(jsonPath("$.dataset[99]").value(100));
	}


	private String body(Object algorithms, String datasetType, Integer size, Object customArray) throws Exception {
		var node = objectMapper.createObjectNode();
		node.set("algorithms", objectMapper.valueToTree(algorithms));
		if (datasetType != null) {
			node.put("datasetType", datasetType);
		}
		if (size != null) {
			node.put("size", size);
		}
		if (customArray != null) {
			node.set("customArray", objectMapper.valueToTree(customArray));
		}
		return objectMapper.writeValueAsString(node);
	}

	static Stream<String> allSortingAlgorithmNames() {
		return SortingAlgorithmFactory.allNames().stream();
	}

	@ParameterizedTest(name = "{0} sorts correctly and reports non-negative counters")
	@MethodSource("com.algorithmrace.visualizer.controller.SimulationControllerIT#allSortingAlgorithmNames")
	@DisplayName("Every registered algorithm actually produces a correctly sorted final frame")
	void shouldSortArrayCorrectlyForEveryRegisteredAlgorithm(String algorithmName) throws Exception {
		List<Integer> custom = List.of(45, 12, 89, 3, 27, 64, 5, 99, 18, 33);
		String req = body(List.of(algorithmName), "Custom Array", custom.size(), custom);

		MvcResult result = mockMvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(req))
				.andExpect(status().isOk())
				.andReturn();

		JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
		JsonNode frames = root.at("/lanes/0/frames");
		JsonNode lastFrame = frames.get(frames.size() - 1);

		assertTrue(lastFrame.get("done").asBoolean(), algorithmName + " should reach a done state");

		int[] finalArray = objectMapper.convertValue(lastFrame.get("array"), int[].class);
		assertTrue(isSorted(finalArray), algorithmName + " did not sort the array correctly");

		JsonNode stats = root.at("/lanes/0/stats");
		assertTrue(stats.get("comparisons").asInt() >= 0, algorithmName + " comparisons should be non-negative");
		assertTrue(stats.get("swaps").asInt() >= 0, algorithmName + " swaps should be non-negative");
	}

	private boolean isSorted(int[] array) {
		for (int i = 1; i < array.length; i++) {
			if (array[i - 1] > array[i]) {
				return false;
			}
		}
		return true;
	}

	@Test
	void shouldGenerateDatasetWhenCustomArrayIsEmpty() throws Exception {

		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":["Bubble Sort"],
								  "datasetType":"Random",
								  "size":10,
								  "customArray":[]
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.dataset.length()").value(10));
	}

	@Test
	void shouldRejectMalformedJson() throws Exception {

		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":["Bubble Sort"]
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void shouldReturnCompleteLaneInformation() throws Exception {

		mockMvc.perform(post(URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "algorithms":["Bubble Sort"],
								  "datasetType":"Random",
								  "size":10
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.lanes[0].name").value("Bubble Sort"))
				.andExpect(jsonPath("$.lanes[0].complexity").exists())
				.andExpect(jsonPath("$.lanes[0].complexityInfo").exists())
				.andExpect(jsonPath("$.lanes[0].stats").exists())
				.andExpect(jsonPath("$.lanes[0].frames").isArray());
	}
}
