<?php

use common\models\CoTenant;
use common\models\PhaProductBatch;
use common\models\RActiveRecord;
use yii\db\ActiveQuery;

namespace common\models;

/**
 * This is the model class for table "pha_stock_adjust_log".
 *
 * @property integer $stock_adjust_log_id
 * @property integer $tenant_id
 * @property integer $batch_id
 * @property string $adjust_date_time
 * @property integer $adjust_from
 * @property integer $adjust_to
 * @property integer $adjust_qty
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PhaProductBatch $batch
 * @property CoTenant $tenant
 */
class PhaStockAdjustLog extends PActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_stock_adjust_log';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['batch_id', 'adjust_date_time', 'adjust_from', 'adjust_to', 'adjust_qty'], 'required'],
                [['tenant_id', 'batch_id', 'adjust_from', 'adjust_to', 'adjust_qty', 'created_by', 'modified_by'], 'integer'],
                [['adjust_date_time', 'created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['batch_id'], 'exist', 'skipOnError' => true, 'targetClass' => PhaProductBatch::className(), 'targetAttribute' => ['batch_id' => 'batch_id']],
                [['tenant_id'], 'exist', 'skipOnError' => true, 'targetClass' => CoTenant::className(), 'targetAttribute' => ['tenant_id' => 'tenant_id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'stock_adjust_log_id' => 'Stock Adjust Log ID',
            'tenant_id' => 'Tenant ID',
            'batch_id' => 'Batch ID',
            'adjust_date_time' => 'Adjust Date Time',
            'adjust_from' => 'Adjust From',
            'adjust_to' => 'Adjust To',
            'adjust_qty' => 'Adjust Qty',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getBatch() {
        return $this->hasOne(PhaProductBatch::className(), ['batch_id' => 'batch_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

}
