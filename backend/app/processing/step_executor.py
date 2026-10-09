from app.core.enums import ProcessingStepName
from app.processing.context import ProcessingContext


class ProcessingStepExecutor:
    def execute(self, step_name: str, context: ProcessingContext) -> None:
        match step_name:
            case ProcessingStepName.LOAD_FILE.value:
                self.load_file(context)

            case ProcessingStepName.EXTRACT_CONTENT.value:
                self.extract_content(context)

            case ProcessingStepName.NORMALIZE_CONTENT.value:
                self.normalize_content(context)

            case ProcessingStepName.STORE_RESULT.value:
                self.store_result(context)

            case _:
                raise ValueError(f"Unknown processing step: {step_name}")

    def load_file(self, context: ProcessingContext) -> None:
        print("Loading evidence file")
        context.data["file_content"] = None

    def extract_content(self, context: ProcessingContext) -> None:
        print("Extracting content")
        context.data["extracted_text"] = None

    def normalize_content(self, context: ProcessingContext) -> None:
        print("Normalizing content")
        context.data["normalized_text"] = None

    def store_result(self, context: ProcessingContext) -> None:
        print("Storing processing result")


processing_step_executor = ProcessingStepExecutor()
