package heat.main;

import org.jpmml.evaluator.ModelEvaluator;
import org.jpmml.evaluator.LoadingModelEvaluatorBuilder;
import org.jpmml.evaluator.InputField;
import org.jpmml.evaluator.OutputField;
import org.jpmml.model.PMMLException;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

public class ModelRunner {
    public static void main(String[] args) {
        try {
            // Load the PMML model using LoadingModelEvaluatorBuilder
            FileInputStream modelFile = new FileInputStream("model/corrected_model.pmml");
            ModelEvaluator<?> modelEvaluator = new LoadingModelEvaluatorBuilder()
                    .load(modelFile)
                    .build();

            // Process input fields
            List<InputField> inputFields = modelEvaluator.getInputFields();
            for (InputField inputField : inputFields) {
                System.out.println("Input Field: " + inputField.getName() + " - " + inputField.getDataType());
            }

            // Process output fields
            List<OutputField> outputFields = modelEvaluator.getOutputFields();
            for (OutputField outputField : outputFields) {
                System.out.println("Output Field: " + outputField.getName() + " - " + outputField.getDataType());
            }

        } catch (IOException | PMMLException | javax.xml.parsers.ParserConfigurationException | org.xml.sax.SAXException | jakarta.xml.bind.JAXBException e) {
            e.printStackTrace();
        }
    }
}

