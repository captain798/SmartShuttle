import os
import json
import logging
import requests
from datetime import datetime
from constants import RedisKeys
from extensions import redis_client

class AIService:
    @staticmethod
    def get_analysis(statistics, date_str):
        """
        获取班次调度建议
        
        Args:
            statistics: 统计数据列表
            date_str: 日期字符串 (YYYY-MM-DD)
            
        Returns:
            dict: 包含调度建议的字典
        """
        try:
            # 尝试从缓存获取
            cache_key = RedisKeys.AI_ANALYSIS.format(date_str)
            cached_analysis = redis_client.get(cache_key)
            if cached_analysis:
                return json.loads(cached_analysis)

            # 计算关键指标
            total_schedules = len(statistics)
            total_reservations = sum(s['total_reservations'] for s in statistics)
            total_checked_in = sum(s['checked_in'] for s in statistics)
            total_seats = sum(s['total_seats'] for s in statistics)
            
            # 计算平均上座率
            avg_occupancy_rate = (total_checked_in / total_seats * 100) if total_seats > 0 else 0

            # 构建提示词
            prompt = f"""请根据以下数据提供班次调度建议：
            
                        日期：{date_str}
                        总班次数：{total_schedules}
                        总预约数：{total_reservations}
                        总签到数：{total_checked_in}
                        总座位数：{total_seats}
                        平均上座率：{avg_occupancy_rate:.1f}%

                        各路线详细数据：
                        {json.dumps(statistics, ensure_ascii=False, indent=2)}

                        请提供以下建议：
                        1. 是否需要增加或减少班次
                        2. 哪些时段的班次需要调整
                        3. 座位容量是否需要调整
                        4. 其他优化建议

                        请用简洁的语言回答，直接给出具体建议。"""

            # 调用大语言模型API
            response = requests.post(
                os.getenv('LLM_API_URL'),
                headers={
                    'Authorization': f"Bearer {os.getenv('LLM_API_KEY')}",
                    'Content-Type': 'application/json'
                },
                json={
                    'prompt': prompt,
                    'max_tokens': 500,
                    'temperature': 0.7
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"API调用失败: {response.text}")

            # 解析API响应
            result = response.json()
            suggestions = result['choices'][0]['text'].strip()

            # 构建分析结果
            analysis = {
                'summary': {
                    'total_schedules': total_schedules,
                    'total_reservations': total_reservations,
                    'total_checked_in': total_checked_in,
                    'total_seats': total_seats,
                    'avg_occupancy_rate': f"{avg_occupancy_rate:.1f}%"
                },
                'suggestions': suggestions
            }

            # 缓存结果（5分钟）
            redis_client.setex(cache_key, 300, json.dumps(analysis))
            return analysis

        except Exception as e:
            logging.error(f"AI分析失败: {str(e)}")
            return {
                'summary': {
                    'total_schedules': total_schedules,
                    'total_reservations': total_reservations,
                    'total_checked_in': total_checked_in,
                    'total_seats': total_seats,
                    'avg_occupancy_rate': f"{avg_occupancy_rate:.1f}%"
                },
                'suggestions': '暂时无法提供调度建议，请稍后再试。'
            }

# 创建单例实例
ai_service = AIService() 