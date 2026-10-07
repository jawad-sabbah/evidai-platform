from app.core.enums import ProcessingStepName


class ProcessingStepExecutor:
    def execute(
        self,
        step_name: str,
    ) -> None:
        match step_name:
            case ProcessingStepName.LOAD_FILE.value:
                self.load_file()

            case ProcessingStepName.EXTRACT_CONTENT.value:
                self.extract_content()

            case ProcessingStepName.NORMALIZE_CONTENT.value:
                self.normalize_content()

            case ProcessingStepName.STORE_RESULT.value:
                self.store_result()

            case _:
                raise ValueError(f"Unknown processing step: {step_name}")

    def load_file(self) -> None:
        print("Loading evidence file")

    def extract_content(self) -> None:
        print("Extracting content")

    def normalize_content(self) -> None:
        print("Normalizing content")

    def store_result(self) -> None:
        print("Storing processing result")


processing_step_executor = ProcessingStepExecutor()
