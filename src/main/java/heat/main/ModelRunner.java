package heat.main;

import org.jpmml.evaluator.InputField;
import org.jpmml.evaluator.LoadingModelEvaluatorBuilder;
import org.jpmml.evaluator.ModelEvaluator;
import org.jpmml.evaluator.OutputField;
import org.jpmml.model.PMMLException;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public class ModelRunner {

    public static void main(String[] args) {
        String resourcePath = "model/corrected_model.pmml";

        try (InputStream is = Thread.currentThread()
                .getContextClassLoader()
                .getResourceAsStream(resourcePath)) {

            if (is == null) {
                throw new IllegalStateException("PMML file not found on classpath: " + resourcePath);
            }

            ModelEvaluator<?> evaluator = new LoadingModelEvaluatorBuilder()
                    .load(is)
                    .build();
            evaluator.verify();

            // Входные поля
            List<InputField> inputFields = evaluator.getInputFields();
            for (InputField f : inputFields) {
                System.out.println("Input Field: " + f.getName()
                        + " | Type: " + f.getDataType());
            }

            // Выходные поля
            List<OutputField> outputFields = evaluator.getOutputFields();
            for (OutputField f : outputFields) {
                System.out.println("Output Field: " + f.getName()
                        + " | Type: " + f.getDataType());
            }

        } catch (ParserConfigurationException | SAXException
                 | PMMLException | IOException e) {
            e.printStackTrace();
            throw new IllegalStateException("Failed to load/verify PMML model", e);
        }
    }
}
