import { Component, OnInit } from '@angular/core';
import { CustomizerSettingsService } from '../../services/customizer-settings.service';
import { ChatOrchestratorService } from 'src/app/chat/chat-orchestrator.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {

  constructor(public themeService: CustomizerSettingsService, private chatOrchestrator: ChatOrchestratorService) {}

  ngOnInit(): void {
  }
}
