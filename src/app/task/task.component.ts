import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { TaskService } from '../shared/task.service';
import { Task } from '../models/task';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  task: Task;
  tasks: Task[] = [];
  taskForm: FormGroup;
  showTaskForm: boolean = false;
  isEdit: boolean = false;
  message: string = null;

  headElements = ['Title', 'Description', ''];

  constructor(private taskService: TaskService, private fb: FormBuilder) { }

  ngOnInit() {
    this.task = new Task();
    this.taskService.getTasks().subscribe(
      (tasks: Task[]) => this.tasks = tasks
    );
    this.taskForm = this.buildForm();
  }



  onDelete(name: string) {
    let confirmed = confirm('Do you want to delete the task?');
    if (confirmed) {
      this.taskService.deleteTask(name).subscribe(
        (response: Response) => {
          this.showTransactionMessage('Deleted successfully!');
          this.taskService.getTasks().subscribe(
            (tasks: Task[]) => this.tasks = tasks
          );
        },
        (error) => this.showTransactionMessage(error)
      );
    }
  }

  onCancel() {
    this.showTaskForm = false;
    this.isEdit = false;
  }

  onUpdate(name: string) {
    this.taskService.getTaskByName(name).subscribe(
      (taskData: Task) => {
        this.task = taskData;
        this.onAddTask();
        this.taskForm.patchValue(this.task);
        this.isEdit = true;
      }
    );
  }

  onAddTask() {
    this.taskForm = this.buildForm();
    this.showTaskForm = true;
    this.isEdit = false;
  }

  buildForm() {
    return this.fb.group({
      'title': this.fb.control(null, [Validators.required]),
      'description': this.fb.control(null, [Validators.required])
    });
  }

  onSubmit() {
    this.task.title = this.taskForm.get('title').value;
    this.task.description = this.taskForm.get('description').value;

    let transactionObservable = this.taskService.addTask(this.task);
    if (this.isEdit) {
      transactionObservable = this.taskService.updateTask(this.task.name, this.task);
    }

    transactionObservable.subscribe(
      (response: Response) => {
        this.showTaskForm = false;
        this.taskForm = null;
        this.isEdit = false;
        this.showTransactionMessage('Added/Updated successfully!');
        this.taskService.getTasks().subscribe(
          (tasks: Task[]) => this.tasks = tasks
        );
      },
      (error) => this.showTransactionMessage(error)
    );
  }

  showTransactionMessage(message: string) {
    this.message = message;
    setTimeout(
      () => this.message = null,
      3000
    );
  }

}
