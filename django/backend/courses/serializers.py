from rest_framework import serializers
from .models import Course, Module, Lesson, Enrollment

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_instructor_name(self, obj):
        return f"{obj.instructor.first_name} {obj.instructor.last_name}"

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'